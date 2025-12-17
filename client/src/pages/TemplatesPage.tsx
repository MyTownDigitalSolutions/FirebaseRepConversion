import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Paper, Button, TextField, Grid, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import RefreshIcon from '@mui/icons-material/Refresh'
import { templatesApi } from '../services/api'
import type { AmazonProductType } from '../types'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AmazonProductType[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<AmazonProductType | null>(null)
  const [productCode, setProductCode] = useState('')
  const [selectedExistingCode, setSelectedExistingCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadTemplates = async () => {
    const data = await templatesApi.list()
    setTemplates(data)
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isUpdate: boolean = false) => {
    const file = event.target.files?.[0]
    const codeToUse = isUpdate ? selectedExistingCode : productCode
    
    if (!file || !codeToUse) {
      setError(isUpdate ? 'Please select a Product Type to update' : 'Please enter a product code before uploading')
      return
    }
    
    setUploading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const result = await templatesApi.import(file, codeToUse)
      const action = isUpdate ? 'Updated' : 'Imported'
      setSuccess(`${action} ${result.fields_imported} fields, ${result.keywords_imported} keywords, ${result.valid_values_imported} valid values`)
      setProductCode('')
      setSelectedExistingCode('')
      loadTemplates()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err.response?.data?.detail || 'Failed to import template')
    } finally {
      setUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleDelete = async (code: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await templatesApi.delete(code)
      loadTemplates()
      if (selectedTemplate?.code === code) {
        setSelectedTemplate(null)
      }
    }
  }

  const viewTemplate = async (code: string) => {
    const template = await templatesApi.get(code)
    setSelectedTemplate(template)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Amazon Templates</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Import New Product Type</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Product Type Code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="e.g., CARRIER_BAG_CASE"
              helperText="Enter the product type code for this template"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              component="label"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
              disabled={uploading || !productCode}
            >
              Upload New Template
              <input type="file" hidden accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, false)} />
            </Button>
          </Grid>
        </Grid>
        
        {templates.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Update Existing Product Type</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Product Type</InputLabel>
                  <Select
                    value={selectedExistingCode}
                    label="Select Product Type"
                    onChange={(e) => setSelectedExistingCode(e.target.value)}
                  >
                    {templates.map((t) => (
                      <MenuItem key={t.id} value={t.code}>{t.code}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  component="label"
                  color="warning"
                  startIcon={uploading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  disabled={uploading || !selectedExistingCode}
                >
                  Upload Updated Template
                  <input type="file" hidden accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, true)} />
                </Button>
              </Grid>
            </Grid>
          </>
        )}
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Imported Templates</Typography>
            {templates.length === 0 ? (
              <Typography color="text.secondary">
                No templates imported yet. Upload an Amazon template file to get started.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Fields</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow 
                        key={template.id}
                        hover
                        selected={selectedTemplate?.id === template.id}
                        onClick={() => viewTemplate(template.code)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{template.code}</TableCell>
                        <TableCell>{template.fields?.length || 0}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(template.code)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Template Fields
              {selectedTemplate && ` - ${selectedTemplate.code}`}
            </Typography>
            
            {selectedTemplate ? (
              <Box>
                {selectedTemplate.keywords && selectedTemplate.keywords.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Keywords:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedTemplate.keywords.map((kw) => (
                        <Chip key={kw.id} label={kw.keyword} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Group</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Valid Values</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTemplate.fields?.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.field_name}</TableCell>
                          <TableCell>{field.attribute_group || '-'}</TableCell>
                          <TableCell>
                            {field.required ? (
                              <Chip label="Required" size="small" color="error" />
                            ) : (
                              <Chip label="Optional" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {field.valid_values?.length > 0 
                              ? `${field.valid_values.length} values`
                              : 'Any'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Select a template to view its fields
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
