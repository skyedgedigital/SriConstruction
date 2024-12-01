import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import MonthlyAction from '@/lib/actions/SafetyEmp/monthly/MonthlyAction';
import { Trash } from 'lucide-react';
import toast from 'react-hot-toast';

const MonthlyTask = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});

  useEffect(() => {
    const fetchMonthlyEvents = async () => {
      try {
        const resp = await MonthlyAction.FETCH.fetchMonthlyEvent();
        const eventsData = JSON.parse(resp.data);
        const formattedEvents = {};
        eventsData.forEach(({ day, month, year, event, _id }) => {
          const dateKey = `${year}-${month}-${day}`;
          if (!formattedEvents[dateKey]) {
            formattedEvents[dateKey] = [];
          }
          formattedEvents[dateKey].push({ event, _id });
        });
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching monthly events:', error);
      }
    };
    fetchMonthlyEvents();
  }, []);

  const handleDelete = async (eventId) => {
    try {
      const resp = await MonthlyAction.DELETE.deleteMonthlyEvent(eventId);
      if (resp.success) {
        toast.success('Event Removed');
        // Update events state after deletion
        const updatedEvents = { ...events };
        Object.keys(updatedEvents).forEach((dateKey) => {
          updatedEvents[dateKey] = updatedEvents[dateKey].filter((event) => event._id !== eventId);
        });
        setEvents(updatedEvents);
      } else {
        toast.error('Failed to remove event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Something went wrong');
    }
  };

  const renderHeader = () => {
    const month = format(currentMonth, 'MM');
    const year = format(currentMonth, 'yyyy');

    return (
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center">
          <button onClick={prevMonth} className="px-2 text-xl">
            &lt;
          </button>
        </div>
        <div className="flex items-center">
          <select
            className="mr-2 p-1 border rounded"
            value={parseInt(month)}
            onChange={(e) => setCurrentMonth(new Date(parseInt(year), parseInt(e.target.value) - 1))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>
                {format(new Date(2020, i), 'MMMM')}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="p-1 border rounded"
            value={year}
            onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), parseInt(month) - 1))}
          />
        </div>
        <div className="flex items-center">
          <button onClick={nextMonth} className="px-2 text-xl">
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'iiii';
    let startDate = startOfWeek(startOfMonth(currentMonth));

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="flex-1 text-center font-medium" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="flex">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        days.push(
          <div
            key={day.toString()}
            className={`p-2 w-24 h-24 border ${
              !isSameMonth(day, monthStart) ? 'bg-gray-100' : isSameDay(day, selectedDate) ? 'bg-blue-200' : ''
            }`}
          >
            <span className="block text-center">{formattedDate}</span>
            <div className="text-xs mt-2 overflow-y-auto max-h-12">
              {events[dateKey] &&
                events[dateKey].map(({ event, _id }, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-200 rounded px-1 mt-1">
                    <span>{event}</span>
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete(_id)}
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="flex">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
    const eventText = prompt('Enter event:');
    if (eventText) {
      const dateKey = format(day, 'yyyy-MM-dd');
      const updatedEvents = { ...events };
      if (!updatedEvents[dateKey]) {
        updatedEvents[dateKey] = [];
      }
      updatedEvents[dateKey].push({ event: eventText });
      setEvents(updatedEvents);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="max-w-2xl mx-auto p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default MonthlyTask;
