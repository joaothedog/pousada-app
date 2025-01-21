import React, { useEffect, useState } from 'react';
import { getInventoryItems, createInventoryItem, deleteInventoryItem } from '../../services/api';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr } from './styles';
import "./styles.css";
import { FaTrashAlt } from 'react-icons/fa';
import { FaPencil } from "react-icons/fa6";

interface InventoryItem {
    id: number;
    name: string;
    location: string;
    quantity: number;
    price: number;
    originalQuantity: number; // Adicionado para rastrear a quantidade original
}

interface InventoryReduction {
    date: string;
    quantity: number;
}

export function GerenciaInventario() {
    const [formData, setFormData] = useState({
        name: '',
        location: 'RECEPCAO',
        quantity: 0,
        price: 0.0,
    });

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [reductions, setReductions] = useState<{ [key: number]: InventoryReduction[] }>({});
    const [reductionData, setReductionData] = useState({ quantity: 0, date: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInventoryItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const items = await getInventoryItems();
            if (Array.isArray(items)) {
                const sanitizedItems = items.map((item) => ({
                    ...item,
                    price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
                    originalQuantity: item.quantity, // Define a quantidade original na carga inicial
                }));
                setInventoryItems(sanitizedItems);

                const storedReductions = localStorage.getItem('reductions');
                if (storedReductions) {
                    setReductions(JSON.parse(storedReductions));
                }

                const storedInventory = localStorage.getItem('inventoryItems');
                if (storedInventory) {
                    setInventoryItems(JSON.parse(storedInventory));
                }
            } else {
                throw new Error('Formato de dados inesperado');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os itens do inventário.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createInventoryItem(formData);
            alert('Item de inventário criado com sucesso!');
            setFormData({
                name: '',
                location: 'RECEPCAO',
                quantity: 0,
                price: 0.0,
            });
            fetchInventoryItems();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar o item de inventário. Por favor, tente novamente.');
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

    const handleOpenModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setReductionData({ quantity: 0, date: '' });
    };

    const handleReductionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setReductionData({
            ...reductionData,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value,
        });
    };

    const handleConfirmReduction = () => {
        if (selectedItem) {
            const formattedDate = new Date(reductionData.date).toLocaleDateString('pt-BR');
            const newReduction = { ...reductionData, date: formattedDate };

            const updatedReductions = {
                ...reductions,
                [selectedItem.id]: [...(reductions[selectedItem.id] || []), newReduction],
            };

            setReductions(updatedReductions);
            localStorage.setItem('reductions', JSON.stringify(updatedReductions));

            const updatedInventoryItems = inventoryItems.map((item) =>
                item.id === selectedItem.id
                    ? { ...item, quantity: item.quantity - newReduction.quantity }
                    : item
            );
            setInventoryItems(updatedInventoryItems);

            localStorage.setItem('inventoryItems', JSON.stringify(updatedInventoryItems));

            setReductionData({ quantity: 0, date: '' });
        }
    };

    const handleDeleteReduction = (itemId: number, reductionIndex: number) => {
        const updatedReductions = {
            ...reductions,
            [itemId]: reductions[itemId].filter((_, index) => index !== reductionIndex),
        };

        const restoredQuantity = reductions[itemId][reductionIndex].quantity;

        setReductions(updatedReductions);
        localStorage.setItem('reductions', JSON.stringify(updatedReductions));

        const updatedInventoryItems = inventoryItems.map((item) =>
            item.id === itemId
                ? { ...item, quantity: item.quantity + restoredQuantity }
                : item
        );

        setInventoryItems(updatedInventoryItems);
        localStorage.setItem('inventoryItems', JSON.stringify(updatedInventoryItems));
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (
        <PageContainer padding="0px">
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    <h1>Cadastro de Itens do Estoque</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro">
                            <div className="row">
                                <div className="input">
                                    <label htmlFor="name">Nome do Item:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ex.: Cadeira de Escritório"
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="location">Localização:</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                    >
                                        <option value="RECEPCAO">Recepção</option>
                                        <option value="COZINHA">Cozinha</option>
                                    </select>
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="quantity">Quantidade:</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="Ex.: 10"
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="price">Preço Unitário (R$):</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Ex.: 50.00"
                                        required
                                    />
                                </div><br></br>
                            </div>
                        </div>
                        <button type="submit" className="button-cadastro">
                            Cadastrar 
                        </button>
                    </form>
                </div>
                <div className="separator" />
                <div className="gerenciar">
                    <h1>Itens do Estoque</h1>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <Container>
                            {inventoryItems.length > 0 ? (
                                inventoryItems.map((item) => (
                                    <Containerr key={item.id} className="banner">
                                        <div className="row">
                                            <p className="nome">
                                                <strong>Item:</strong> {item.name}
                                            </p>
                                            <p className="localizacao">
                                                <strong>Local:</strong> {item.location === 'RECEPCAO' ? 'Recepção' : 'Cozinha'}
                                            </p>
                                            <p className="quantidade">
                                                <strong>Quantidade:</strong> {item.quantity}
                                            </p>
                                            <p className="preco">
                                                <strong>Preço:</strong> R$ {item.price.toFixed(2)}
                                            </p>
                                            <div className="buttons-inv">
                                                <FaPencil className='edit' size={20} onClick={() => handleOpenModal(item)} />
                                                <FaTrashAlt
                                                    className="lixeira"
                                                    size={20}
                                                    onClick={() => handleDelete(item.id)}
                                                />
                                            </div>
                                        </div>
                                    </Containerr>
                                ))
                            ) : (
                                <p>Nenhum item encontrado.</p>
                            )}
                        </Container>
                    )}
                </div>

                {selectedItem && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Dar Baixa no Estoque</h2>
                            <p>
                                <strong>Item:</strong> {selectedItem.name}
                            </p>
                            <label>
                                Quantidade:
                                <input
                                    type="number"
                                    name="quantity"
                                    value={reductionData.quantity}
                                    onChange={handleReductionChange}
                                    min="1"
                                    max={selectedItem.quantity}
                                    required
                                />
                            </label>
                            <label>
                                Data:
                                <input
                                    type="date"
                                    name="date"
                                    value={reductionData.date}
                                    onChange={handleReductionChange}
                                    required
                                />
                            </label>
                            <button onClick={handleConfirmReduction}>Confirmar Baixa</button>
                            <button onClick={handleCloseModal}>Cancelar</button>
                            <div className="reductions">
                                <h3>Baixas Realizadas:</h3>
                                <ul>
                                    {(reductions[selectedItem.id] || []).map((reduction, index) => (
                                        <li key={index}>
                                            <strong>Data:</strong> {reduction.date} - <strong>Quantidade:</strong> {reduction.quantity} <button onClick={() => handleDeleteReduction(selectedItem.id, index)}>Excluir</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}

export default GerenciaInventario;
