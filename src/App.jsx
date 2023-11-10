import { useState, useEffect } from "react";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import data from "./data/data.json";

const result = data.reduce((acc, { Date, time }) => {
  acc[Date] = acc[Date] || [];
  acc[Date].push(time);
  return acc;
}, {});

const output = Object.keys(result).map((Date) => ({
  Date,
  times: result[Date],
}));

function matchDates(outputArray, WeekDayArray) {
  const result = [];

  WeekDayArray.forEach(({ date: weekDayDate }) => {
    const matchingEntry = outputArray.find(({ Date }) => {
      // Convert outputArray Date to match the format of WeekDayArray date
      const outputArrayDateParts = Date.split("-");
      const formattedOutputArrayDate = `${outputArrayDateParts[2]}/${outputArrayDateParts[1]}/${outputArrayDateParts[0]}`;
      return formattedOutputArrayDate === weekDayDate;
    });

    if (matchingEntry) {
      result.push({
        times: matchingEntry.times,
      });
    } else {
      result.push({
        times: null,
      });
    }
  });

  return result;
}

function App() {
  let [istTimes, setIstTimes] = useState([]);
  const [date, setDate] = useState(
    new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
  const [weekDays, setWeekDays] = useState(getCurrentWeekArray(new Date(date)));
  let [matchingDates, setMatchingDates] = useState(
    matchDates(output, weekDays)
  );

  useEffect(() => {
    setWeekDays(getCurrentWeekArray(new Date(date)));
    setMatchingDates(matchDates(output, weekDays));
  }, [date]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col space-y-8 items-center w-3/4 h-4/5">
        <Header setDate={setDate} date={date} />
        <TimeZone istTimes={istTimes} setIstTimes={setIstTimes} />
        <Week
          weekDays={weekDays}
          matchingDates={matchingDates}
          istTimes={istTimes}
        />
      </div>
    </div>
  );
}

function Header({ date, setDate }) {
  function handlePrevious() {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    setDate(
      newDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  function handleNext() {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    setDate(
      newDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  return (
    <header className="flex justify-around w-full h-8">
      <button onClick={handlePrevious} className="flex items-center space-x-2">
        <BsFillCaretLeftFill className="inline-block" />
        <span>Previous Week</span>
      </button>
      <span>{date}</span>
      <button onClick={handleNext} className="flex items-center space-x-2">
        <span>Next Week</span>
        <BsFillCaretRightFill className="inline-block" />
      </button>
    </header>
  );
}

function TimeZone({ istTimes, setIstTimes }) {
  const [selectedTimeZone, setSelectedTimeZone] = useState("5.5");

  useEffect(() => {
    // Call the appropriate function based on the initial selected time zone
    if (Number(selectedTimeZone) === 5.5) generateIST(setIstTimes);
    else if (Number(selectedTimeZone) === 0) generateGMT(istTimes, setIstTimes);
  }, []); // Empty dependency array ensures this effect runs once on mount

  function handleTimeZone(e) {
    e.preventDefault();
    setSelectedTimeZone(e.target.value);
    if (Number(e.target.value) === 5.5) generateIST(setIstTimes);
    else if (Number(e.target.value) === 0) generateGMT(istTimes, setIstTimes);
  }

  return (
    <div className="self-start flex flex-col space-y-4 w-full">
      <label htmlFor="">TimeZone :</label>
      <select
        onChange={handleTimeZone}
        className="w-full h-6"
        value={selectedTimeZone}
        name="selectTimeZone"
        id=""
      >
        <option defaultValue={true} value="5.5">
          [UTC +5.30] Indian Standard Time
        </option>
        <option value="0">[UTC +0] Greenwich Mean Time</option>
      </select>
    </div>
  );
}

function getCurrentWeekArray(inputDate) {
  const currentDate = inputDate || new Date(); // Use the input date or current date
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  let currentDatePointer = new Date(currentDate.getTime()); // Start from the input date
  let currentWeekNumber = 1;

  while (currentDatePointer <= lastDayOfMonth) {
    if (currentDatePointer.getDay() === 0) {
      // Sunday is the start of a new week
      const currentWeek = Array.from({ length: 7 }, () => {
        if (currentDatePointer > lastDayOfMonth) {
          return null; // For days beyond the end of the month
        }

        const formattedDate = `${currentDatePointer.getFullYear()}/${
          currentDatePointer.getMonth() + 1
        }/${currentDatePointer.getDate()}`;
        const result = {
          dayName: currentDatePointer.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          date: formattedDate,
        };

        currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        return result;
      });

      return currentWeek;
    }

    currentDatePointer.setDate(currentDatePointer.getDate() - 1); // Move to the previous day
  }
  return null; // Return null if the current week is not found in the month
}

// // Example usage:
// const inputDate = new Date("2023-11-12"); // Customize the input date
// const currentWeekArray = getCurrentWeekArray(inputDate);

function generateIST(setIstTimes) {
  let timeArray = [];

  for (let hour = 8; hour <= 23; hour++) {
    for (let minute of ["00", "30"]) {
      const period = hour < 12 ? "am" : "pm";
      const formattedHour = hour % 12 || 12;
      const istTime = `${String(formattedHour).padStart(
        2,
        "0"
      )}:${minute} ${period}`;
      timeArray.push(istTime);
    }
  }

  setIstTimes(timeArray);
}

function generateGMT(istTimes, setIstTimes) {
  const timeArray = istTimes.map((time) => convertToGMT(time, 5.5));
  setIstTimes(timeArray);
}

function convertToGMT(time, timezoneOffset) {
  const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);

  // Convert time to milliseconds
  let timestamp =
    parseInt(hours, 10) * 60 * 60 * 1000 + parseInt(minutes, 10) * 60 * 1000;

  // Adjust for the timezone offset
  timestamp -= timezoneOffset * 60 * 60 * 1000;

  // Ensure the result is positive and less than 24 hours
  timestamp = (24 * 60 * 60 * 1000 + timestamp) % (24 * 60 * 60 * 1000);

  // Format the result as hh:mm am/pm
  const resultHours = Math.floor(timestamp / (60 * 60 * 1000));
  const resultMinutes = Math.floor(
    (timestamp % (60 * 60 * 1000)) / (60 * 1000)
  );

  const formattedResultHours = resultHours % 12 || 12;
  const resultPeriod = resultHours < 12 ? "am" : "pm";

  return `${String(formattedResultHours).padStart(2, "0")}:${String(
    resultMinutes
  ).padStart(2, "0")} ${resultPeriod}`;
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString?.split("/")?.map(Number);
  return new Date(year, month - 1, day);
}

function Week({ weekDays, istTimes, matchingDates }) {
  return (
    <div className="w-full h-full grid grid-cols-6 gap-x-6">
      <WeekDayComp weekDays={weekDays} />
      <GenerateCheckBoxes
        matchingDates={matchingDates}
        weekDays={weekDays}
        istTimes={istTimes}
      />
    </div>
  );
}

function GenerateCheckBoxes({ weekDays, istTimes, matchingDates }) {
  const currentDate = new Date();
  const previousDate = new Date(currentDate);
  previousDate.setDate(currentDate.getDate() - 1);

  return (
    <ul className="col-span-5 w-full flex flex-col space-y-10">
      {weekDays?.map((day, index) =>
        day === null ? null : parseDate(day?.date) < previousDate ? (
          <span key={uuidv4()} className="flex justify-start h-28">
            Past
          </span>
        ) : (
          <CheckListComp
            weekDays={weekDays}
            istTimes={istTimes}
            day={index}
            matchingDates={matchingDates}
            key={uuidv4()}
          />
        )
      )}
    </ul>
  );
}

function WeekDayComp({ weekDays }) {
  return (
    <ul className="col-span-1 space-y-12">
      {weekDays?.map((day) => (
        <DayComp day={day} key={uuidv4()} />
      ))}
    </ul>
  );
}

function DayComp({ day }) {
  return (
    <li className="flex flex-col items-center h-28">
      <span>{day?.dayName}</span>
      <span>{day?.date}</span>
    </li>
  );
}

function CheckListComp({ istTimes, matchingDates, day }) {
  return (
    <ul className="flex items-center justify-start flex-wrap h-28">
      {istTimes.map((checkBox, index) => (
        <CheckBox
          label={checkBox}
          key={index + 1}
          isChecked={
            matchingDates[day].times?.includes(checkBox) ? true : false
          }
        />
      ))}
    </ul>
  );
}

// console.log(output);

function CheckBox({ label, isChecked }) {
  return (
    <li className="px-8">
      <div>
        <label>
          <input className="mr-2" type="checkbox" defaultChecked={isChecked} />
          <span>{label}</span>
        </label>
      </div>
    </li>
  );
}

export default App;
