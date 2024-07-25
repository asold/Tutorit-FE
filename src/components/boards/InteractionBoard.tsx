import React, { useRef, useState, useEffect } from 'react';
import { Box, ButtonGroup, IconButton } from '@mui/material';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import BrushIcon from '@mui/icons-material/Brush';
import CreateIcon from '@mui/icons-material/Create';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EraserIcon from '@mui/icons-material/FormatColorReset';
import BorderHorizontalIcon from '@mui/icons-material/BorderHorizontal';
import GridOnIcon from '@mui/icons-material/GridOn';
import ImageIcon from '@mui/icons-material/Image';

const canvasStyles = {
  simple: {
    background: 'white',
  },
  horizontalLines: {
    background: 'repeating-linear-gradient(white, white 29px, #ccc 30px)',
  },
  mathGrid: {
    background: 'repeating-linear-gradient(white, white 29px, #ccc 30px), repeating-linear-gradient(90deg, white, white 29px, #ccc 30px)',
  },
};

const InteractionBoard = () => {
  const canvasRef = useRef<any>(null);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [canvasStyle, setCanvasStyle] = useState('simple');
  const [key, setKey] = useState(0); // Add key state to force re-render

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

  const changeCanvasStyle = (style: string) => {
    setCanvasStyle(style);
    setKey(prevKey => prevKey + 1); // Update key to force re-render
  };

  useEffect(() => {
    clearCanvas();
  }, [canvasStyle]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', mt: 2, background: 'red' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexDirection: 'row', justifyContent: 'space-between', background: 'grey', width: '100%' }}>
        <ButtonGroup size="small" variant="contained">
          <IconButton onClick={() => changeCanvasStyle('simple')}><ImageIcon /></IconButton>
          <IconButton onClick={() => changeCanvasStyle('horizontalLines')}><BorderHorizontalIcon /></IconButton>
          <IconButton onClick={() => changeCanvasStyle('mathGrid')}><GridOnIcon /></IconButton>
        </ButtonGroup>
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
      <Box sx={{ flex: 1, width: '100%', height: '100%', position: 'relative', background: 'yellow' }}>
        <ReactSketchCanvas
          key={key} // Add key prop to force re-render
          ref={canvasRef}
          style={{ width: '100%', height: '100%', ...canvasStyles[canvasStyle] }}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
        />
      </Box>
    </Box>
  );
};

export default InteractionBoard;
