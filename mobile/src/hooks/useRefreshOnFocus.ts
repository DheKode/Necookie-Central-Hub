import { useFocusEffect } from 'expo-router';
import { useEffect, useRef } from 'react';

export function useRefreshOnFocus(callback: () => void) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useFocusEffect(
        useRef(() => {
            callbackRef.current();
        }).current,
    );
}
