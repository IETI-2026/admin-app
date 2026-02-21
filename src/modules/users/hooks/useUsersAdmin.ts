import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '../../../core/http/http-error';
import {
  getUsersRequest,
  hardDeleteUserRequest,
  softDeleteUserRequest,
  updateUserRequest,
} from '../api/users.api';
import type { UserResponse, UserStatus } from '../../../types/api';

interface UseUsersAdminResult {
  users: UserResponse[];
  userStatusFilter: UserStatus;
  setUserStatusFilter: (status: UserStatus) => void;
  isLoading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: UserStatus) => Promise<void>;
  deleteUser: (userId: string, hard?: boolean) => Promise<void>;
}

export function useUsersAdmin(active: boolean): UseUsersAdminResult {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus>('ACTIVE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUsersRequest({
        page: 0,
        limit: 20,
        status: userStatusFilter,
      });

      setUsers(response.users);
    } catch (requestError) {
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No fue posible cargar usuarios.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userStatusFilter]);

  useEffect(() => {
    if (!active) {
      return;
    }

    void loadUsers();
  }, [active, loadUsers]);

  const toggleUserStatus = useCallback(
    async (userId: string, currentStatus: UserStatus): Promise<void> => {
      setError(null);
      try {
        const newStatus: UserStatus =
          currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        await updateUserRequest(userId, { status: newStatus });
        await loadUsers();
      } catch (requestError) {
        const message =
          requestError instanceof HttpError
            ? requestError.message
            : 'No se pudo actualizar el estado del usuario.';
        setError(message);
      }
    },
    [loadUsers],
  );

  const deleteUser = useCallback(
    async (userId: string, hard = false): Promise<void> => {
      setError(null);
      try {
        if (hard) {
          await hardDeleteUserRequest(userId);
        } else {
          await softDeleteUserRequest(userId);
        }
        await loadUsers();
      } catch (requestError) {
        const message =
          requestError instanceof HttpError
            ? requestError.message
            : 'No se pudo eliminar el usuario.';
        setError(message);
      }
    },
    [loadUsers],
  );

  return {
    users,
    userStatusFilter,
    setUserStatusFilter,
    isLoading,
    error,
    loadUsers,
    toggleUserStatus,
    deleteUser,
  };
}
