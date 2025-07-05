"use client";

import { useState } from "react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // カレンダーに表示するデュミーデータ
  const dummyData = [
    { date: 15, amount: 3000, type: "expense", tag: "食費" },
    { date: 20, amount: 5000, type: "expense", tag: "交通費" },
    { date: 25, amount: 30000, type: "income", tag: "給料" },
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  // カレンダーの日付を生成
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // 前月の空白
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const getDataForDay = (day: number) => {
    return dummyData.filter((item) => item.date === day);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">カレンダー</h1>

      <div className="bg-white shadow-md rounded-lg p-3 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 text-lg"
            aria-label="前月へ"
          >
            &lt;
          </button>

          <h2 className="text-base sm:text-xl font-semibold">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 text-lg"
            aria-label="次月へ"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center font-medium p-1 sm:p-2 text-xs sm:text-sm"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[60px] sm:min-h-[100px] border rounded-md p-1 sm:p-2 ${
                day === null ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              {day !== null && (
                <>
                  <div className="text-right text-xs sm:text-sm">{day}</div>
                  <div>
                    {getDataForDay(day).map((item, i) => (
                      <div
                        key={i}
                        className={`mt-1 p-0.5 sm:p-1 rounded text-[10px] sm:text-xs truncate ${
                          item.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {item.tag}: ¥{item.amount.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
