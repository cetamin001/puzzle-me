
// components/puzzle-components.tsx
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface TimerProps {
    isRunning: boolean;
    onTime: (time: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTime }) => {
    const [time, setTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        onTime(time);
    }, [time, onTime]);

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            Time: {formatTime(time)}
        </div>
    );
};

interface HintProps {
    getHint: () => Promise<void>;
}

export const Hint: React.FC<HintProps> = ({ getHint }) => {
    return (
        <Button onClick={getHint}>Get Hint</Button>
    );
};
