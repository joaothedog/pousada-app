import React, { useEffect, useState } from 'react';
import { getReservationById, getInventoryItems, createReservationItem } from '../../services/api';
import { Reservation, InventoryItem, ReservationItem } from '../../types/types';

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
    const [selectedItems, setSelectedItems] = useState<ReservationItem[]>([]);
    const [itemQuantities, setItemQuantities] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        const fetchReservationData = async () => {
            try {
                const reservation = await getReservationById(reservationId);
                const inventoryData = await getInventoryItems();

                setReservationData(reservation.data);
                setInventoryItems(inventoryData);
                setSelectedItems(reservation.data.consumed_items || []);
            } catch (error) {
                console.error('Erro ao carregar dados da reserva:', error);
            }
        };

        fetchReservationData();
    }, [reservationId]);

    const handleAddItem = async (itemId: number, quantity: number) => {
        if (quantity <= 0 || isNaN(quantity)) {
            alert('Quantidade inválida.');
            return;
        }

        const item = inventoryItems.find((i) => i.id === itemId);
        if (item && reservationData) {
            const consumedQuantity = selectedItems
                .filter((selectedItem) => selectedItem.item.id === item.id)
                .reduce((acc, selectedItem) => acc + selectedItem.quantity, 0);

            if (item.quantity - consumedQuantity <= 0) {
                alert('Quantidade insuficiente.');
                return;
            }

            const existingItem = selectedItems.find((i) => i.item.id === itemId);

            try {
                const data = {
                    reservation: reservationData.id,
                    item: itemId,
                    item_details: item,
                    quantity: quantity,
                    total_price: item.price * quantity,
                };
                await createReservationItem(data);

                if (existingItem) {
                    setSelectedItems((prevItems) =>
                        prevItems.map((i) =>
                            i.item.id === itemId
                                ? {
                                      ...i,
                                      quantity: i.quantity + quantity,
                                      total_price: item.price * (i.quantity + quantity),
                                  }
                                : i
                        )
                    );
                } else {
                    setSelectedItems((prevItems) => [
                        ...prevItems,
                        {
                            id: Date.now(),
                            reservation: reservationData,
                            item,
                            item_details: item,
                            quantity,
                            total_price: item.price * quantity,
                        },
                    ]);
                }

                onItemsAdded(selectedItems);
            } catch (error) {
                console.error('Erro ao adicionar item à reserva:', error);
                alert('Erro ao adicionar item. Tente novamente.');
            }
        } else {
            alert('Item não encontrado ou dados da reserva estão incompletos.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        for (const itemId in itemQuantities) {
            const quantity = itemQuantities[parseInt(itemId)];
            await handleAddItem(parseInt(itemId), quantity);
        }
    };

    const handleQuantityChange = (itemId: number, quantity: number) => {
        setItemQuantities((prevQuantities) => ({
            ...prevQuantities,
            [itemId]: quantity,
        }));
    };

    if (!reservationData) return <p>Carregando...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Adicionar Itens Consumidos</h2>

            <div>
                <label>Itens Disponíveis:</label>
                <div>
                    {inventoryItems.map((item) => {
                        const consumedQuantity = selectedItems
                            .filter((selectedItem) => selectedItem.item.id === item.id)
                            .reduce((acc, selectedItem) => acc + selectedItem.quantity, 0);

                        return (
                            <div key={item.id}>
                                <span>{item.name} - {item.price} R$</span>
                                <p>Quantidade disponível: {item.quantity - consumedQuantity}</p>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Quantidade"
                                    value={itemQuantities[item.id] || 0}
                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <button type="button" onClick={onClose}>
                Cancelar
            </button>
            <button type="submit">Adicionar Itens</button>
        </form>
    );
};

export default AddConsumptionForm;
