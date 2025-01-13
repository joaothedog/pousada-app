import React, { useEffect, useState } from 'react';
import { getInventoryItems, deleteInventoryItem } from '../../services/api'; // Funções para comunicação com a API
import { InventoryItem } from '../../types/types'; // Tipos definidos previamente

const InventoryTable: React.FC = () => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventoryItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const items = await getInventoryItems();
            setInventoryItems(items);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os itens do inventário.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm('Tem certeza que deseja excluir este item?');
        if (confirmDelete) {
            try {
                await deleteInventoryItem(id);
                alert('Item excluído com sucesso!');
                fetchInventoryItems();
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir o item. Por favor, tente novamente.');
            }
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Itens do Inventário</h2>
            <table border={1} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Localização</th>
                        <th>Quantidade</th>
                        <th>Preço (R$)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryItems.length > 0 ? (
                        inventoryItems.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.location === 'RECEPCAO' ? 'Recepção' : 'Cozinha'}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price}</td>
                                <td>
                                    <button onClick={() => handleDelete(item.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>Nenhum item encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
