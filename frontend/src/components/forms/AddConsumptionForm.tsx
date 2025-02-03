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

    const handleAddItem = async () => {
        if (!selectedItem || itemQuantity <= 0) {
            alert("Selecione um item e insira uma quantidade válida.");
            return;
        }
    
        if (!reservationData) {
            alert("Erro: A reserva ainda não foi carregada corretamente.");
            return;
        }
    
        // Verifica se há estoque suficiente antes de adicionar à reserva
        if (selectedItem.quantity < itemQuantity) {
            alert("Quantidade insuficiente no estoque.");
            return;
        }
    
        try {
            // **Novo estoque após adição**
            const updatedQuantity = selectedItem.quantity - itemQuantity;
    
            // **Requisição para atualizar a quantidade no backend**
            await fetch(`/api/inventory/${selectedItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: updatedQuantity }),
            });
    
            // **Cria o novo item consumido no backend**
            const newConsumedItem = {
                reservation: reservationData.id,
                item: selectedItem.id,
                quantity: itemQuantity,
                total_price: selectedItem.price * itemQuantity,
            };
    
            const response = await createReservationItem(newConsumedItem);

            if (!response || !response.data || !response.data.id) { 
                alert("Erro ao salvar item consumido no backend.");
                return;
            }
            const newItemId = response.data.id;
            // **Garante que os itens já consumidos sejam mantidos e adiciona o novo item**
            const updatedItems = [...selectedItems, {
                 id: newItemId,  // Agora usamos o ID correto
                reservation: reservationData,
                item: selectedItem,
                item_details: selectedItem,
                quantity: itemQuantity,
                total_price: selectedItem.price * itemQuantity,
            }];
    
            // **Atualiza o estado corretamente**
            setSelectedItems(updatedItems);
            onItemsAdded(updatedItems);
    
            // **Atualiza localmente a lista de estoque**
            const updatedInventory = inventoryItems.map((item) =>
                item.id === selectedItem.id ? { ...item, quantity: updatedQuantity } : item
            );
            setInventoryItems(updatedInventory);
            localStorage.setItem("inventoryItems", JSON.stringify(updatedInventory));
    
            // **Atualiza a reserva no backend (mantendo os itens já consumidos)**
            await fetch(`/api/reservations/${reservationData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    consumed_items: updatedItems.map(item => ({
                        id: item.id,
                        item: item.item.id,
                        quantity: item.quantity,
                        total_price: item.total_price,
                    }))
                }),
            });
    
            // Resetando os campos após a adição
            setSelectedItem(null);
            setItemQuantity(1);
    
            alert("Item adicionado com sucesso e estoque atualizado!");
        } catch (error) {
            console.error("Erro ao adicionar item à reserva:", error);
            alert("Erro ao adicionar item. Tente novamente.");
        }
    };
    
    
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
                onClick={handleAddItem}
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
