// src/components/InteractionBoard.tsx

import React, { useRef, useState } from 'react';
import { Box, Container, ButtonGroup, IconButton } from '@mui/material';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import BrushIcon from '@mui/icons-material/Brush';
import CreateIcon from '@mui/icons-material/Create';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EraserIcon from '@mui/icons-material/FormatColorReset';

const InteractionBoard = () => {
  const canvasRef = useRef<any>(null);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(4);

  const clearCanvas = () => {
    canvasRef.current.clearCanvas();
  };

  const undoLast = () => {
    canvasRef.current.undo();
  };

  const redoLast = () => {
    canvasRef.current.redo();
  };

  const setPencil = (color: string, size: number) => {
    setStrokeColor(color);
    setStrokeWidth(size);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexDirection: 'row', alignItems: 'center' }}>
          <ButtonGroup size="small" variant="contained">
            <IconButton onClick={() => setPencil("#000", 2)}><CreateIcon /></IconButton>
            <IconButton onClick={() => setPencil("#000", 4)}><BrushIcon /></IconButton>
            <IconButton onClick={() => setPencil("#f00", 2)}><CreateIcon style={{ color: 'red' }} /></IconButton>
            <IconButton onClick={() => setPencil("#f00", 4)}><BrushIcon style={{ color: 'red' }} /></IconButton>
            <IconButton onClick={() => setPencil("#fff", 10)}><EraserIcon /></IconButton>
          </ButtonGroup>
          <ButtonGroup size="small" variant="contained">
            <IconButton onClick={clearCanvas}><ClearIcon /></IconButton>
            <IconButton onClick={undoLast}><UndoIcon /></IconButton>
            <IconButton onClick={redoLast}><RedoIcon /></IconButton>
          </ButtonGroup>
        </Box>
        <ReactSketchCanvas
          ref={canvasRef}
          width="800px"
          height="600px"
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
        />
      </Box>
    </Container>
  );
};

export default InteractionBoard;
