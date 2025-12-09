import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // API base URL
    const API_URL = 'http://localhost:5001/api/cart';

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch cart from backend
    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError(err.response?.data?.message || 'Failed to fetch cart');
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    // Add item to cart
    const addToCart = async (apartmentId, mode, months = 12) => {
        if (!user) {
            toast.error('Please login to add items to cart');
            return { success: false };
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.post(
                API_URL,
                { apartmentId, mode, months },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchCart(); // Refresh cart
                toast.success(`Added to cart successfully`);
                return { success: true, data: response.data.data };
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            const errorMsg = err.response?.data?.message || 'Failed to add to cart';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Update cart item
    const updateCartItem = async (itemId, updates) => {
        if (!user) {
            toast.error('Please login to update cart');
            return { success: false };
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.patch(
                `${API_URL}/${itemId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchCart(); // Refresh cart
                toast.success('Cart updated');
                return { success: true, data: response.data.data };
            }
        } catch (err) {
            console.error('Error updating cart item:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update cart';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        if (!user) {
            toast.error('Please login to remove items');
            return { success: false };
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_URL}/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                await fetchCart(); // Refresh cart
                toast.success('Removed from cart');
                return { success: true };
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            const errorMsg = err.response?.data?.message || 'Failed to remove from cart';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle item selection
    const toggleSelection = async (itemId) => {
        if (!user) return { success: false };

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.patch(
                `${API_URL}/${itemId}/select`,
                { selected: !cartItems.find(item => item.id === itemId)?.selected },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchCart(); // Refresh cart
                return { success: true };
            }
        } catch (err) {
            console.error('Error toggling selection:', err);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    // Select all items
    const selectAll = async (selected = true) => {
        if (!user) return { success: false };

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.patch(
                `${API_URL}/select-all`,
                { selected },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchCart(); // Refresh cart
                return { success: true };
            }
        } catch (err) {
            console.error('Error selecting all:', err);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        if (!user) return { success: false };

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.delete(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setCartItems([]);
                toast.success('Cart cleared');
                return { success: true };
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            const errorMsg = err.response?.data?.message || 'Failed to clear cart';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Get cart summary
    const getCartSummary = async () => {
        if (!user) return null;

        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                return response.data.data;
            }
        } catch (err) {
            console.error('Error getting cart summary:', err);
            return null;
        }
    };

    // Checkout cart - Create lease requests for selected items
    const checkout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            return { success: false };
        }

        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
            toast.error('No items selected for checkout');
            return { success: false };
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_URL}/checkout`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchCart(); // Refresh cart (selected items should be removed)
                console.log('✅ Checkout Success:', response.data.data);
                toast.success(response.data.message);
                return {
                    success: true,
                    data: response.data.data
                };
            }
        } catch (err) {
            console.error('Error during checkout:', err);
            const errorMsg = err.response?.data?.message || 'Failed to checkout';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate totals from local cart items
    const calculateTotals = () => {
        const selectedItems = cartItems.filter(item => item.selected);

        const rentTotal = selectedItems
            .filter(item => item.mode === 'rent')
            .reduce((sum, item) => {
                const monthlyRent = parseFloat(item.priceSnapshot) || 0;
                const deposit = parseFloat(item.depositSnapshot) || 0;
                const maintenance = parseFloat(item.maintenanceFeeSnapshot) || 0;
                return sum + (monthlyRent * item.months) + deposit + (maintenance * item.months);
            }, 0);

        const buyTotal = selectedItems
            .filter(item => item.mode === 'buy')
            .reduce((sum, item) => {
                const price = parseFloat(item.priceSnapshot) || 0;
                const maintenance = parseFloat(item.maintenanceFeeSnapshot) || 0;
                return sum + price + (maintenance * 12); // Assume 1 year maintenance for purchase
            }, 0);

        return {
            totalItems: cartItems.length,
            selectedItems: selectedItems.length,
            rentTotal,
            buyTotal,
            grandTotal: rentTotal + buyTotal
        };
    };

    const value = {
        cartItems,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        toggleSelection,
        selectAll,
        clearCart,
        checkout,
        fetchCart,
        getCartSummary,
        calculateTotals,
        cartItemCount: cartItems.length
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
