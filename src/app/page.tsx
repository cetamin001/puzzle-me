"use client";
import { useState, useEffect, useRef } from 'react';
import { generatePuzzle, shuffle } from '@/lib/puzzle-generator';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateHint } from "@/ai/flows/hint-generator";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Hint, Timer } from "@/components/puzzle-components";

const PUZZLE_SIZE = 4; // You can change this to 3 for a 3x3 puzzle, etc.
const IMAGE_URL = 'https://picsum.photos/400/400';

export default function Home() {
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [shuffledPuzzle, setShuffledPuzzle] = useState<number[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const generatedPuzzle = generatePuzzle(PUZZLE_SIZE * PUZZLE_SIZE);
    setPuzzle(generatedPuzzle);
    resetPuzzle(generatedPuzzle); // Initialize with a shuffled puzzle
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = IMAGE_URL;
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageError(true);
    };
    imageRef.current = img;
  }, []);

  const resetPuzzle = (initialPuzzle: number[]) => {
    const shuffled = shuffle([...initialPuzzle]);
    setShuffledPuzzle(shuffled);
    setMoveCount(0);
    setGameStarted(false);
    setGameWon(false);
    setSelectedPieceIndex(null);
    setHintIndex(null);
  };

  const handlePieceClick = (index: number) => {
    setSelectedPieceIndex(index);
    setHintIndex(null); // Clear previous hint
  };

  const getHint = async () => {
    if (selectedPieceIndex === null) {
      toast({
        title: "Please select a puzzle piece first.",
      });
      return;
    }

    try {
      const hint = await generateHint({
        puzzleSolution: puzzle,
        currentArrangement: shuffledPuzzle,
        selectedPieceIndex: selectedPieceIndex,
      });
      setHintIndex(hint.correctPositionIndex);
      toast({
        title: "Hint provided!",
        description: "Check the highlighted position.",
      });
    } catch (error: any) {
      console.error("Error generating hint:", error);
      toast({
        title: "Error",
        description: "Failed to generate hint. Please try again.",
      });
    }
  };

  const swapPieces = (fromIndex: number, toIndex: number) => {
    const newShuffledPuzzle = [...shuffledPuzzle];
    [newShuffledPuzzle[fromIndex], newShuffledPuzzle[toIndex]] = [newShuffledPuzzle[toIndex], newShuffledPuzzle[fromIndex]];
    setShuffledPuzzle(newShuffledPuzzle);
  };

  const handlePieceDrop = (dropIndex: number) => {
    if (selectedPieceIndex === null) return;

    swapPieces(selectedPieceIndex, dropIndex);
    setSelectedPieceIndex(null);
    setHintIndex(null);
    setMoveCount((prevCount) => prevCount + 1);
    setGameStarted(true); // Consider the game started once the user makes a move
  };

  useEffect(() => {
    // Check for win condition after every move
    if (gameStarted && shuffledPuzzle.length > 0) {
      const isSolved = shuffledPuzzle.every((piece, index) => piece === puzzle[index]);
      if (isSolved) {
        setGameWon(true);
        toast({
          title: "Congratulations!",
          description: "You solved the puzzle!",
        });
      }
    }
  }, [shuffledPuzzle, puzzle, gameStarted]);

  const isCorrectPosition = (index: number) => {
    return hintIndex !== null && hintIndex === index;
  };

  const tileWidth = imageLoaded ? imageRef.current!.width / PUZZLE_SIZE : 0;
  const tileHeight = imageLoaded ? imageRef.current!.height / PUZZLE_SIZE : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">PuzzleMe</h1>

      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center">
          {imageError && (
            <div className="text-red-500">Failed to load image. Please try again later.</div>
          )}

          <div className="grid" style={{ gridTemplateColumns: `repeat(${PUZZLE_SIZE}, 1fr)` }}>
            {shuffledPuzzle.map((piece, index) => (
              <div
                key={index}
                className={cn(
                  "w-24 h-24 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer",
                  selectedPieceIndex === index && "ring-2 ring-primary",
                  isCorrectPosition(index) && "bg-accent/50",
                  gameWon && "cursor-default"
                )}
                onClick={() => !gameWon && handlePieceClick(index)}
                onDrop={(e) => {
                  e.preventDefault();
                  !gameWon && handlePieceDrop(index);
                }}
                onDragOver={(e) => e.preventDefault()}
                draggable={selectedPieceIndex === index && !gameWon}
                onDragStart={(e) => {}}
              >
                {imageLoaded ? (
                  <div
                    style={{
                      width: tileWidth,
                      height: tileHeight,
                      backgroundImage: `url(${IMAGE_URL})`,
                      backgroundPosition: `-${(piece - 1) % PUZZLE_SIZE * tileWidth}px -${Math.floor((piece - 1) / PUZZLE_SIZE) * tileHeight}px`,
                    }}
                  />
                ) : (
                  <div className="animate-pulse bg-gray-300 w-full h-full" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between w-full mt-4">
            <Button variant="secondary" onClick={() => resetPuzzle(puzzle)}>Reset</Button>
            <Hint getHint={getHint} />
          </div>

          <div className="flex justify-between w-full mt-2">
            <p>Moves: {moveCount}</p>
            <Timer isRunning={gameStarted && !gameWon} onTime={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
