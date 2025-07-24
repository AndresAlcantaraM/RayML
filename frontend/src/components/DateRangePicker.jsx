import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subYears } from 'date-fns';
import './DateRangePicker.css';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const today = new Date();
  const minDate = subYears(today, 5);

  const calendarTheme = {
    daySize: 40,
    colors: {
      accessibility: '#4f46e5',
      selectedDay: '#4f46e5',
      selectedDayHover: '#4338ca',
      primaryColor: '#4f46e5',
    }
  };

  return (
    <div className="date-range-container">
      <div className="date-picker-group">
        <div className="date-picker-wrapper">
          <label className="date-picker-label">
            <span className="date-picker-icon">📅</span>
            Fecha de Inicio
          </label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={endDate || today}
            minDate={minDate}
            dateFormat="dd/MM/yyyy"
            className="date-picker-input"
            placeholderText="Seleccione fecha inicial"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            popperModifiers={{
              offset: {
                enabled: true,
                offset: '5px, 10px'
              },
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: 'viewport'
              }
            }}
            calendarClassName="custom-calendar"
          />
        </div>

        <div className="date-picker-wrapper">
          <label className="date-picker-label">
            <span className="date-picker-icon">📅</span>
            Fecha de Fin
          </label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            className="date-picker-input"
            placeholderText="Seleccione fecha final"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            calendarClassName="custom-calendar"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;