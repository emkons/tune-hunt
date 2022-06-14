import { useState, useEffect } from 'react'

const useLocalStorage = (storageKey, defaultValue) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        const savedValue = localStorage.getItem(storageKey)
        if (savedValue === undefined || savedValue === 'undefined') {
            return
        }

        setValue(JSON.parse(savedValue))
    }, [storageKey]);

    useEffect(() => {
        if (value && Object.keys(value).length === 0) {
            return
        }

        localStorage.setItem(storageKey, JSON.stringify(value))
        // eslint-disable-next-line
    }, [value])

    const updateValue = (newValue) => {
        setValue(newValue)
    }

    return [value, updateValue]
}

export default useLocalStorage
