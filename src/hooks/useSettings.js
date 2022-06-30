import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const useSettings = (key, defaultValue) => {

    const value = useLiveQuery(async () => {
        const val = await db.settings.get(key)
        console.log(val)
        if (val === undefined) {
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue
        } else {
            return val.value
        }
    }, [key], typeof defaultValue === 'function' ? defaultValue() : defaultValue)

    const updateValue = (newValue) => {
        db.settings.put({key: key, value: newValue})
    }

    return [value, updateValue]
}

export default useSettings
