import React from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface ChartSelectProps {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  options: SelectOption[];
  minWidth?: number;
  maxWidth?: number;
  placeholder?: string;
  className?: string;
}

const ChartSelect: React.FC<ChartSelectProps> = ({
  value,
  onChange,
  options,
  minWidth = 160,
  maxWidth,
  placeholder = 'Select option',
  className = ''
}) => {
  // Group options if they have a group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.default;

  return (
    <FormControl 
      size="small" 
      className={className}
      sx={{ 
        mb: 2, 
        alignSelf: 'center',
        minWidth,
        ...(maxWidth && { maxWidth })
      }}
    >
      <Select
        value={value}
        onChange={onChange}
        displayEmpty={!value}
        MenuProps={{
          PaperProps: {
            sx: {
              opacity: 1,
              color: 'black',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              maxHeight: 300,
            }
          }
        }}
        sx={{
          color: 'white',
          fontSize: '0.75rem',
          height: 32,
          '& .MuiOutlinedInput-input': {
            padding: '6px 14px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiSelect-icon': {
            color: 'white',
          },
        }}
      >
        {!value && (
          <MenuItem value="" disabled>
            <em style={{ opacity: 0.6 }}>{placeholder}</em>
          </MenuItem>
        )}
        
        {hasGroups ? (
          // Render grouped options
          Object.entries(groupedOptions).map(([groupName, groupOptions]) => [
            groupName !== 'default' && (
              <MenuItem 
                key={`group-${groupName}`} 
                disabled 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#666 !important',
                  backgroundColor: 'rgba(0,0,0,0.05) !important'
                }}
              >
                {groupName}
              </MenuItem>
            ),
            ...groupOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={groupName !== 'default' ? { pl: 3 } : {}}
              >
                {option.label}
              </MenuItem>
            ))
          ]).flat().filter(Boolean)
        ) : (
          // Render flat options
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default ChartSelect;