import { useEffect, useRef } from 'react';

export default function useWebSocket(onMessageReceived) {
  const ws = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // Keep callback handler up to date without breaking effects
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    let connectInterval;
    let isUnmounted = false;

    const connect = () => {
      // Safely map WebSocket endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('ChefPulse WebSocket pipeline established.');
      };

      ws.current.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const data = JSON.parse(event.data);
          if (callbackRef.current) {
            callbackRef.current(data);
          }
        } catch (err) {
          console.error('WebSocket payload parsing error:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('ChefPulse WebSocket connection severed. Reconnecting...');
        if (!isUnmounted) {
          connectInterval = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket pipeline exception:', err);
        ws.current.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (ws.current) {
        ws.current.close();
      }
      clearTimeout(connectInterval);
    };
  }, []);

  return ws.current;
}
