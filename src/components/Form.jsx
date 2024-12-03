import React, { useState } from 'react';
import { Button, TextField, MenuItem, Select, InputLabel, FormControl, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import { Box } from '@mui/system';

// Mock API responses (simulating backend responses)
const API_RESPONSES = {
  'User Information': {
    fields: [
      { name: "firstName", type: "text", label: "First Name", required: true },
      { name: "lastName", type: "text", label: "Last Name", required: true },
      { name: "age", type: "number", label: "Age", required: false }
    ]
  },
  'Address Information': {
    fields: [
      { name: "street", type: "text", label: "Street", required: true },
      { name: "city", type: "text", label: "City", required: true },
      { 
        name: "state", 
        type: "dropdown", 
        label: "State", 
        options: ["California", "Texas", "New York"], 
        required: true 
      },
      { name: "zipCode", type: "text", label: "Zip Code", required: false }
    ]
  },
  'Payment Information': {
    fields: [
      { name: "cardNumber", type: "text", label: "Card Number", required: true },
      { name: "expiryDate", type: "date", label: "Expiry Date", required: true },
      { name: "cvv", type: "password", label: "CVV", required: true },
      { name: "cardholderName", type: "text", label: "Cardholder Name", required: true }
    ]
  }
};

const DynamicForm = () => {
  const [selectedFormType, setSelectedFormType] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form type selection handler
  const handleFormTypeChange = (event) => {
    const type = event.target.value;
    setSelectedFormType(type);
    const fields = API_RESPONSES[type]?.fields || [];
    setFormFields(fields);
    
    // Reset form state
    setFormData({});
    setErrors({});
    setProgress(0);
  };

  // Input change handler
  const handleInputChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Progress calculation
    const requiredFields = formFields.filter(field => field.required);
    const completedRequiredFields = requiredFields.filter(field => 
      updatedFormData[field.name] && updatedFormData[field.name].trim() !== ''
    );
    const newProgress = (completedRequiredFields.length / requiredFields.length) * 100;
    setProgress(newProgress);

    // Clear specific field error when input changes
    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    setErrors(updatedErrors);
  };

  // Form submission handler
  const handleSubmit = () => {
    const newErrors = {};
    
    // Validate required fields
    formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Type-specific validations
    if (selectedFormType === 'Payment Information') {
      const cardNumberRegex = /^\d{16}$/;
      if (formData.cardNumber && !cardNumberRegex.test(formData.cardNumber)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Editing existing entry
    if (isEditing && editingId) {
      const updatedSubmittedData = submittedData.map(entry => 
        entry.id === editingId 
          ? { ...formData, id: editingId, formType: selectedFormType } 
          : entry
      );
      setSubmittedData(updatedSubmittedData);
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Adding new entry
      const submissionData = { 
        ...formData, 
        id: Date.now(), 
        formType: selectedFormType 
      };
      setSubmittedData([...submittedData, submissionData]);
    }

    // Success feedback
    setSuccessMessage(isEditing ? 'Form updated successfully!' : 'Form submitted successfully!');
    
    // Reset form after submission
    setTimeout(() => {
      setSuccessMessage('');
      setSelectedFormType('');
      setFormFields([]);
      setFormData({});
      setProgress(0);
      setIsEditing(false);
      setEditingId(null);
    }, 2000);
  };

  // Edit submitted data
  const handleEdit = (id) => {
    const entryToEdit = submittedData.find(entry => entry.id === id);
    setSelectedFormType(entryToEdit.formType);
    setFormFields(API_RESPONSES[entryToEdit.formType].fields);
    
    // Populate form with existing data
    const editedFormData = { ...entryToEdit };
    delete editedFormData.id;
    delete editedFormData.formType;
    setFormData(editedFormData);

    // Set editing state
    setIsEditing(true);
    setEditingId(id);

    // Calculate initial progress
    const requiredFields = API_RESPONSES[entryToEdit.formType].fields.filter(field => field.required);
    const completedRequiredFields = requiredFields.filter(field => 
      editedFormData[field.name] && editedFormData[field.name].trim() !== ''
    );
    const initialProgress = (completedRequiredFields.length / requiredFields.length) * 100;
    setProgress(initialProgress);
  };

  // Delete submitted data
  const handleDelete = (id) => {
    const updatedSubmittedData = submittedData.filter(entry => entry.id !== id);
    setSubmittedData(updatedSubmittedData);
  };

  return (
    <div className="container mx-auto p-10 px-20">
      <Card>
        <CardContent>
          {/* Form Type Selection */}
          <div className="mb-4">
            <FormControl fullWidth>
              <InputLabel>Select Form Type</InputLabel>
              <Select
                value={selectedFormType}
                onChange={handleFormTypeChange}
                label="Select Form Type"
              >
                {Object.keys(API_RESPONSES).map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Dynamic Form Fields */}
          {selectedFormType && (
            <div>
              {formFields.map(field => (
                <div key={field.name} className="mb-4">
                  <Typography variant="subtitle1">{field.label} {field.required && <span className="text-red-500">*</span>}</Typography>
                  {field.type === 'dropdown' ? (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select 
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        value={formData[field.name] || ''}
                      >
                        {field.options.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      type={field.type}
                      label={field.label}
                      variant="outlined"
                      fullWidth
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (isEditing ? "Update Form" : "Submit Form")}
              </Button>

              {/* Success Message */}
              {successMessage && (
                <Alert severity="success" className="mt-4">
                  {successMessage}
                </Alert>
              )}
            </div>
          )}

          {/* Submitted Data Table */}
          {submittedData.length > 0 && (
            <div className="mt-8">
              <Typography variant="h6" gutterBottom>Submitted Data</Typography>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Form Type</th>
                      <th className="border p-2">Details</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((entry) => (
                      <tr key={entry.id}>
                        <td className="border p-2">{entry.formType}</td>
                        <td className="border p-2">{JSON.stringify(entry, null, 2)}</td>
                        <td className="border p-2">
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            onClick={() => handleEdit(entry.id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={() => handleDelete(entry.id)} 
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicForm;