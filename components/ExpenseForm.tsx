import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategorySelector from './CategorySelector';
import { ArrowLeft, Calendar, PlusCircle } from 'lucide-react-native';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { addExpense, categories } = useExpenses();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      await addExpense({
        amount: parseFloat(amount),
        category: selectedCategory?.name || 'Other',
        description: description.trim() || 'No description',
        date: date.toISOString(),
      });

      // Reset form
      setAmount('');
      setDescription('');
      setSelectedCategory(categories[0]);
      setDate(new Date());

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Expense</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#000"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                const numericValue = text.replace(/[^0-9.]/g, '');
                setAmount(numericValue);
              }}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this expense for?"
            placeholderTextColor="#000"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}
          >
            <Calendar size={20} color="#666" style={styles.dateIcon} />
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <PlusCircle size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Adding...' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
