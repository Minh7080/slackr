const useState = (initialValue) => {
  let value = initialValue;
  const listeners = new Set();

  const getter = () => value;
  const setter = (newValue) => {
    const updatedValue = typeof newValue === 'function'
      ? newValue(value)
      : newValue;

    if (updatedValue === value) return;
    value = updatedValue;
    // Notify subscribers
    listeners.forEach(callback => callback(value));
  };

  const subscribe = (callback) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
  };

  const logListeners = () => console.log(listeners);

  return [getter, setter, subscribe, logListeners];
};

export {
  useState,
};
