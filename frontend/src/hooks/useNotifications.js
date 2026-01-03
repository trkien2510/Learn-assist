import { useNotifications } from '../contexts/NotificationContext';

const useNotificationsHook = () => {
    return useNotifications();
};

export default useNotificationsHook;
