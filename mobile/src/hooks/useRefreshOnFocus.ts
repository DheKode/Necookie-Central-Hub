import { useFocusEffect } from 'expo-router';
import { useCallback, useEffectEvent } from 'react';

export function useRefreshOnFocus(callback: () => void) {
    const onFocus = useEffectEvent(callback);

    useFocusEffect(
        useCallback(() => {
            onFocus();
        }, [onFocus]),
    );
}
