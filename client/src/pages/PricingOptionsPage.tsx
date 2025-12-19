import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, InputAdornment
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { pricingApi } from '../services/api'
import type { PricingOption } from '../types'

export default function PricingOptionsPage() {
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PricingOption | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const loadPricingOptions = async () => {
    const data = await pricingApi.listOptions()
    setPricingOptions(data)
  }

  useEffect(() => {
    loadPricingOptions()
  }, [])

  const handleOpenDialog = (option?: PricingOption) => {
    if (option) {
      setEditing(option)
      setName(option.name)
      setPrice(option.price.toString())
    } else {
      setEditing(null)
      setName('')
      setPrice('')
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const data = {
      name,
      price: parseFloat(price) || 0
    }
    if (editing) {
      await pricingApi.updateOption(editing.id, data)
    } else {
      await pricingApi.createOption(data)
    }
    setDialogOpen(false)
    loadPricingOptions()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this pricing option?')) {
      await pricingApi.deleteOption(id)
      loadPricingOptions()
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Pricing Options</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Pricing Option
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pricing options are add-on features that can be assigned to equipment types. 
        When creating or editing an equipment type, you can select which pricing options apply.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricingOptions.map((option) => (
              <TableRow key={option.id}>
                <TableCell>{option.name}</TableCell>
                <TableCell align="right">${option.price.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(option)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(option.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {pricingOptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No pricing options found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Pricing Option' : 'Add Pricing Option'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!name.trim() || !price || parseFloat(price) < 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
