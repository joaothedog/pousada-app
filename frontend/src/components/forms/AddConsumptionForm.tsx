import React, { useEffect, useState } from 'react';
import { getReservationById, getInventoryItems, createReservationItem } from '../../services/api';
import { Reservation, InventoryItem, ReservationItem } from '../../types/types';
import { FaTrashAlt } from 'react-icons/fa';

interface AddConsumptionFormProps {
    reservationId: number;
    onClose: () => void;
    onItemsAdded: (updatedItems: ReservationItem[]) => void;
}

const AddConsumptionForm: React.FC<AddConsumptionFormProps> = ({
    reservationId,
    onClose,
    onItemsAdded,
}) => {
    const [reservationData, setReservationData] = useState<Reservation | null>(null);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [selectedItems, setSelectedItems] = useState<ReservationItem[]>([]);



    

    useEffect(() => {
        const fetchReservationData = async () => {
            try {
                const reservation = await getReservationById(reservationId);
                const inventoryData = await getInventoryItems();

                // Filtrar apenas os itens que estão na recepção
                const receptionItems = inventoryData.filter((item) => item.location === 'RECEPCAO');

                setReservationData(reservation.data);
                setInventoryItems(receptionItems);
                setSelectedItems(reservation.data.consumed_items || []);
            } catch (error) {
                console.error('Erro ao carregar dados da reserva:', error);
            }
        };

        fetchReservationData();
    }, [reservationId]);

    const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedItemId = parseInt(e.target.value);
        const item = inventoryItems.find((item) => item.id === selectedItemId);
        setSelectedItem(item || null);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemQuantity(parseInt(e.target.value) || 1);
    };

    const handleAddItemToReservation = async () => {
        if (!selectedItem || itemQuantity <= 0) {
            alert("Selecione um item e insira uma quantidade válida.");
            return;
        }
    
        if (!reservationData) {
            alert("Erro: A reserva ainda não foi carregada corretamente.");
            return;
        }
    
        const payload = {
            reservation: reservationData.id,
            item: selectedItem.id,
            quantity: itemQuantity,
            total_price: selectedItem.price * itemQuantity,
        };
    
        console.log("Enviando payload:", payload); // 🔥 Debug para verificar os dados enviados
    
        try {
            // 🔥 Adiciona o item consumido na reserva e atualiza o estoque no backend
            const response = await createReservationItem(payload);
            const newItem = response.data;
    
            console.log("Resposta do backend:", newItem);
    
            alert("Item adicionado com sucesso!");
    
            // 🔥 Atualiza o estado local para exibir o item consumido na UI
            setSelectedItems((prev) => [...prev, newItem]);
    
            // 🔥 Atualiza a reserva para exibir os itens consumidos corretamente
            const updatedReservation = await getReservationById(reservationData.id);
            setReservationData(updatedReservation.data);
            setSelectedItems(updatedReservation.data.consumed_items || []);
    
        } catch (error) {
            console.error("Erro ao adicionar item à reserva:", error);
            alert("Erro ao adicionar item. Verifique os dados.");
        }
    };
    
    useEffect(() => {
        const fetchReservationData = async () => {
            try {
                const reservation = await getReservationById(reservationId);
                const inventoryData = await getInventoryItems();
    
                const receptionItems = inventoryData.filter((item) => item.location === 'RECEPCAO');
    
                setReservationData(reservation.data);
                setInventoryItems(receptionItems);
                setSelectedItems(reservation.data.consumed_items || []);
            } catch (error) {
                console.error('Erro ao carregar dados da reserva:', error);
            }
        };
    
        fetchReservationData();
    }, [reservationId, selectedItems]); // 🔥 Agora, o efeito roda sempre que um item for adicionado.
    
    
    
    if (!reservationData) return <p>Carregando...</p>;

    return (
        <div>
        
            {/* Seleção de itens da recepção */}
            
            <select onChange={handleItemSelect} value={selectedItem?.id || ''} style={{marginLeft:"3%"}}>
                <option value="">Selecione um item</option>
                {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name} - {item.price} R$
                    </option>
                ))}
            </select>
            <br />

            {/* Input para definir a quantidade */}
            <input
                type="number"
                min="1"
                value={itemQuantity}
                onChange={handleQuantityChange}
                placeholder="Quantidade"
                style={{ marginTop: "4%", width: "67.5%",marginLeft:"3%" }}
            />
            <br />

            {/* Botão para adicionar o item consumido */}
            <button
                style={{ marginTop: "4%", width: "71%", cursor: "pointer",marginLeft:"3%" }}
                onClick={handleAddItemToReservation}
            >
                Adicionar
            </button>

            {/* Exibição dos itens consumidos */}
            <h3 style={{marginLeft:"8%"}}>Itens Consumidos</h3>
            <div className="consumed-items-list">
                {selectedItems.length > 0 ? (
                    selectedItems.map((item, index) => (
                        <div key={index} className="consumed-item banner">
                            <div className="row">
                                <p style={{ marginLeft: "13%" }}>
                                    <strong>Item:</strong> {item.item_details?.name} - <strong>Qtd:</strong> {item.quantity}
                                </p>
                                {/*<div className='buttons-re'>
                            <FaTrashAlt className='lixeira-re' size={20} />
                            </div>*/}
                                
                            </div>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
            </div>

           
        </div>
    );
};

export default AddConsumptionForm;
