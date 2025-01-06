import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Link,
  Divider
} from '@mui/material';
import { Upload, FileText, Download } from 'lucide-react';

interface IntegrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Source System,Source Subsystem,Target System,Target Subsystem,Integration Type,Technical Details,Business Domain Tags,Data Types,Data Direction,Notes',
      'Example App,Payment Service,Finance System,Transaction Processor,API,{"endpoint": "api/v1/payments","auth": "OAuth2"},Finance;Payments,Transaction Data;Payment Status,Bidirectional,Daily sync of payment data',
      'CRM System,Customer Module,Data Warehouse,Customer Schema,Database,"{"connection": "jdbc","schema": "customers"}",Customer;Sales,Customer Profile;Preferences,Source to Target,Real-time customer updates'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integration_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/integrations/bulk-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload integration data');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Bulk Upload Integration Data
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Template Format
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Download our template CSV file to ensure your data is formatted correctly. The template includes example rows and all required columns.
        </Typography>
        <Button
          startIcon={<Download />}
          variant="outlined"
          onClick={downloadTemplate}
          sx={{ mt: 1 }}
        >
          Download Template
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            id="integration-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="integration-file-upload">
            <Button
              component="span"
              variant="contained"
              startIcon={<Upload />}
              fullWidth
              sx={{ height: 100, borderRadius: 2 }}
            >
              {file ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={24} />
                  <Typography>{file.name}</Typography>
                </Box>
              ) : (
                'Choose File or Drag & Drop'
              )}
            </Button>
          </label>
          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
            Supported formats: CSV, Excel (.xlsx, .xls)
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Upload
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default IntegrationForm; 