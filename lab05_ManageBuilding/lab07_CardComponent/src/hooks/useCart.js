import { useMemo, useState } from 'react';

const useCart = (initial = []) => {
  const [items, setItems] = useState(initial);

  const addItem = (item) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => p.id === item.id ? { ...p, ...item } : p);
      }
      return [...prev, { ...item, selected: true }];
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  };

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  const toggleSelect = (id) => setItems((prev) => prev.map((p) => p.id === id ? { ...p, selected: !p.selected } : p));
  const selectAll = (value = true) => setItems((prev) => prev.map((p) => ({ ...p, selected: value })));

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    let rent = 0, buy = 0, count = 0;
    items.forEach((item) => {
      if (item.selected) {
        count += 1;
        if (item.mode === 'rent') rent += (item.price || 0) * (item.months || 1);
        if (item.mode === 'buy') buy += (item.price || 0);
      }
    });
    return { rentTotal: rent, buyTotal: buy, grandTotal: rent + buy, selectedCount: count };
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    toggleSelect,
    selectAll,
    clear,
    totals
  };
};

export default useCart;
