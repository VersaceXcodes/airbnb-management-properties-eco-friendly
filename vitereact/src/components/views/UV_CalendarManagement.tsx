import React, { useState } from 'react';
import { useAppStore } from '@/store/main';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface Booking {
  date: string;
  status: string;
  property_id: string;
}

const UV_CalendarManagement: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const [calendarData, setCalendarData] = useState<Booking[]>([]);

  const mutation = useMutation<any, Error, string[]>({
    mutationFn: async (propertyIds: string[]) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/calendar/sync`,
        { property_id: propertyIds },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return data;
    },
    onSuccess: (data: any) => {
      setCalendarData(
        (data.updatedDates || []).map((date: Booking) => ({
          date: date.date,
          status: date.status,
          property_id: date.property_id
        }))
      );
    }
  });

  const handleSync = () => {
    const propertyIds = calendarData.map(calendar => calendar.property_id);
    mutation.mutate(propertyIds);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-blue-600 text-white py-4">
          <h1 className="text-center text-2xl font-bold">Calendar Management</h1>
        </header>
        <main className="p-4 flex-1">
          <div className="mb-4">
            <button
              onClick={handleSync}
              disabled={mutation.isPending}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Syncing...' : 'Synchronize with Airbnb'}
            </button>
          </div>
          <div aria-live="polite">
            <h2 className="text-xl mb-4">Booking Schedule</h2>
            {calendarData.map((booking, index) => (
              <div key={index} className="border p-4 mb-2">
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Property ID:</strong> {booking.property_id}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_CalendarManagement;
