
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function BreakScheduleTable({ title, breakSlots, maxAgentsPerSlot = 1, isAdmin = false, clearAllSignal }) {
  const [assignments, setAssignments] = useState(() => {
    const initialized = {};
    breakSlots.forEach(slot => {
      initialized[slot] = Array(maxAgentsPerSlot).fill("");
    });
    return initialized;
  });

  const [confirmedCells, setConfirmedCells] = useState(() => {
    const initialized = {};
    breakSlots.forEach(slot => {
      initialized[slot] = Array(maxAgentsPerSlot).fill(false);
    });
    return initialized;
  });

  const [userHasConfirmed, setUserHasConfirmed] = useState(false);
  const inputRefs = useRef({});

  const handleInputChange = (slot, index, value) => {
    const nameExists = Object.values(assignments).some(row => row.includes(value));

    const cleanedAssignments = { ...assignments };
    Object.keys(cleanedAssignments).forEach(key => {
      cleanedAssignments[key] = cleanedAssignments[key].map(name => (name === value ? "" : name));
    });

    if (!nameExists || value === "") {
      cleanedAssignments[slot][index] = value;
      setAssignments(cleanedAssignments);
    }
  };

  const confirmInput = (slot, index) => {
    if (assignments[slot][index].trim() !== "") {
      setConfirmedCells(prev => {
        const updated = { ...prev };
        updated[slot][index] = true;
        return updated;
      });

      if (!isAdmin) {
        setUserHasConfirmed(true);
      }
    }
  };

  const handleKeyPress = (e, slot, index) => {
    if (e.key === "Enter") {
      confirmInput(slot, index);
      e.target.blur();
    }
  };

  const handleBlur = (slot, index) => {
    confirmInput(slot, index);
  };

  useEffect(() => {
    if (clearAllSignal) {
      const resetAssignments = {};
      const resetConfirmed = {};
      breakSlots.forEach(slot => {
        resetAssignments[slot] = Array(maxAgentsPerSlot).fill("");
        resetConfirmed[slot] = Array(maxAgentsPerSlot).fill(false);
      });
      setAssignments(resetAssignments);
      setConfirmedCells(resetConfirmed);
      setUserHasConfirmed(false);
    }
  }, [clearAllSignal]);

  return (
    <Card className="mt-10 w-full overflow-x-auto">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
        <table className="table-auto w-full border mb-4">
          <thead>
            <tr className="bg-gray-200">
              {breakSlots.map((slot, i) => (
                <th key={i} className="border px-4 py-2 text-center text-sm font-medium">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(maxAgentsPerSlot)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {breakSlots.map((slot, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="border px-2 py-1 text-center">
                    <Input
                      type="text"
                      ref={el => (inputRefs.current[`${slot}-${rowIndex}`] = el)}
                      value={assignments[slot][rowIndex]}
                      onChange={(e) => handleInputChange(slot, rowIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, slot, rowIndex)}
                      onBlur={() => handleBlur(slot, rowIndex)}
                      disabled={(confirmedCells[slot][rowIndex] || userHasConfirmed) && !isAdmin}
                      maxLength={12}
                      className={`text-sm text-center ${confirmedCells[slot][rowIndex] ? 'font-bold cursor-not-allowed' : ''}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function BreakSchedulePage() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [clearSignal, setClearSignal] = useState(false);

  const correctPassword = "admin123";

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPasswordInput(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === correctPassword) {
      setIsAdmin(true);
      setShowPasswordInput(false);
      setPasswordInput("");
    } else {
      alert("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  const clearAllSlots = () => {
    setClearSignal(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
      <h2 className="text-lg font-medium text-gray-700 mb-2">{today}</h2>

      <BreakScheduleTable
        title="🍽️ Lunch Break"
        breakSlots={["9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM"]}
        maxAgentsPerSlot={3}
        isAdmin={isAdmin}
        clearAllSignal={clearSignal}
      />

      <BreakScheduleTable
        title="☕ First Tea Break"
        breakSlots={[
          "7:00 PM", "7:15 PM", "7:30 PM", "7:45 PM",
          "8:00 PM", "8:15 PM", "8:30 PM", "8:45 PM"
        ]}
        maxAgentsPerSlot={2}
        isAdmin={isAdmin}
        clearAllSignal={clearSignal}
      />

      <BreakScheduleTable
        title="☕ Second Tea Break"
        breakSlots={[
          "12:00 AM", "12:15 AM", "12:30 AM", "12:45 AM",
          "1:00 AM", "1:15 AM", "1:30 AM", "1:45 AM"
        ]}
        maxAgentsPerSlot={2}
        isAdmin={isAdmin}
        clearAllSignal={clearSignal}
      />

      <div className="mt-6">
        <button
          onClick={handleAdminToggle}
          className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900"
        >
          {isAdmin ? "Disable Admin Mode" : "Enable Admin Mode"}
        </button>
      </div>

      {showPasswordInput && !isAdmin && (
        <div className="mt-4 flex items-center space-x-2">
          <Input
            type="password"
            placeholder="Enter Admin Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="text-sm"
          />
          <button
            onClick={handlePasswordSubmit}
            className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="mt-6">
          <button
            onClick={clearAllSlots}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          >
            Clear All Slots
          </button>
        </div>
      )}
    </div>
  );
}

export default BreakSchedulePage;
