import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ExpenseForm from '../../components/ExpenseForm';

export default function AddExpenseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ExpenseForm
        onSuccess={() => {
          // You can navigate or perform other actions on success
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});