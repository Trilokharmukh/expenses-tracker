import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpenses } from '../context/ExpenseContext';
import { Category, ExpenseFilterOptions } from '../types';
import { X, Filter, Calendar, Search, Check } from 'lucide-react-native';
import { formatDate } from '../utils/date';

// interface ExpenseFilterOptions {
//   dateRange: any;
//   searchQuery?: string;
//   startDate?: Date;
//   endDate?: Date;
//   categories?: string[];
// }

const ExpenseFilter: React.FC = () => {
  const {
    categories,
    filterOptions,
    setFilterOptions,
    clearFilters,
  } = useExpenses();

  const [showFilter, setShowFilter] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempFilters, setTempFilters] = useState<ExpenseFilterOptions>({
    searchQuery: filterOptions.searchQuery || '',
    startDate: filterOptions.startDate,
    endDate: filterOptions.endDate,
    categories: filterOptions.categories || [],
  });

  const handleApplyFilters = () => {
    setFilterOptions(tempFilters);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setTempFilters({
      searchQuery: '',
      startDate: undefined,
      endDate: undefined,
      categories: [],
    });
    setShowFilter(false);
  };

  const handleCategoryToggle = (categoryName: string) => {
    setTempFilters((prev) => {
      const currentCategories = prev.categories || [];

      if (currentCategories.includes(categoryName)) {
        // Remove category
        return {
          ...prev,
          categories: currentCategories.filter((cat) => cat !== categoryName),
        };
      } else {
        // Add category
        return {
          ...prev,
          categories: [...currentCategories, categoryName],
        };
      }
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setTempFilters((prev) => ({
        ...prev,
        dateRange: {
          startDate: selectedDate.toISOString(),
          endDate: prev.dateRange?.endDate || new Date().toISOString(),
        },
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setTempFilters((prev) => ({
        ...prev,
        dateRange: {
          startDate: prev.dateRange?.startDate || new Date().toISOString(),
          endDate: selectedDate.toISOString(),
        },
      }));
    }
  };

  const handleSearchChange = (text: string) => {
    setTempFilters((prev) => ({ ...prev, searchQuery: text }));
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filterOptions.categories && filterOptions.categories.length > 0) ||
      filterOptions.dateRange ||
      filterOptions.minAmount !== undefined ||
      filterOptions.maxAmount !== undefined ||
      filterOptions.searchQuery
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={tempFilters.searchQuery}
            onChangeText={handleSearchChange}
          />
          {tempFilters.searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setTempFilters((prev) => ({ ...prev, searchQuery: '' }));
                setFilterOptions((prev) => ({
                  ...prev,
                  searchQuery: undefined,
                }));
              }}
            >
              <X size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters() && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilter}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Expenses</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: (
                          tempFilters.categories || []
                        ).includes(category.name)
                          ? category.color
                          : '#f0f0f0',
                      },
                    ]}
                    onPress={() => handleCategoryToggle(category.name)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: (tempFilters.categories || []).includes(
                            category.name
                          )
                            ? '#fff'
                            : '#333',
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                    {(tempFilters.categories || []).includes(category.name) && (
                      <Check size={16} color="#fff" style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Calendar size={18} color="#666" style={styles.dateIcon} />
                  <Text style={styles.dateButtonText}>
                    {tempFilters.dateRange?.startDate
                      ? formatDate(tempFilters.dateRange.startDate)
                      : 'Start Date'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.dateRangeSeparator}>to</Text>

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Calendar size={18} color="#666" style={styles.dateIcon} />
                  <Text style={styles.dateButtonText}>
                    {tempFilters.dateRange?.endDate
                      ? formatDate(tempFilters.dateRange.endDate)
                      : 'End Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showStartDatePicker && (
                <DateTimePicker
                  value={
                    tempFilters.dateRange?.startDate
                      ? new Date(tempFilters.dateRange.startDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={
                    tempFilters.dateRange?.endDate
                      ? new Date(tempFilters.dateRange.endDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                />
              )}

              <Text style={styles.filterSectionTitle}>Amount Range</Text>
              <View style={styles.amountRangeContainer}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountRangeLabel}>Min</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={
                      tempFilters.minAmount !== undefined
                        ? tempFilters.minAmount.toString()
                        : ''
                    }
                    onChangeText={(text) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        minAmount: text ? parseFloat(text) : undefined,
                      }))
                    }
                  />
                </View>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountRangeLabel}>Max</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="∞"
                    keyboardType="numeric"
                    value={
                      tempFilters.maxAmount !== undefined
                        ? tempFilters.maxAmount.toString()
                        : ''
                    }
                    onChangeText={(text) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        maxAmount: text ? parseFloat(text) : undefined,
                      }))
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: '#06B6D4',
  },
  filterButtonText: {
    color: '#333fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontWeight: '500',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    flex: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666',
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  amountRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInputContainer: {
    width: '48%',
  },
  amountRangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExpenseFilter;
