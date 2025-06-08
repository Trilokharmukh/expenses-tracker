import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Category } from '../types';
import {
  ShoppingBag,
  Car,
  Chrome as Home,
  Tv,
  Heart,
  Zap,
  MoveHorizontal as MoreHorizontal,
  Utensils,
} from 'lucide-react-native';

type CategorySelectorProps = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
};

const getCategoryIcon = (iconName: string, size = 20, color = '#fff') => {
  switch (iconName) {
    case 'utensils':
      return <Utensils size={size} color={color} />;
    case 'car':
      return <Car size={size} color={color} />;
    case 'home':
      return <Home size={size} color={color} />;
    case 'tv':
      return <Tv size={size} color={color} />;
    case 'shopping-bag':
      return <ShoppingBag size={size} color={color} />;
    case 'heart':
      return <Heart size={size} color={color} />;
    case 'zap':
      return <Zap size={size} color={color} />;
    default:
      return <MoreHorizontal size={size} color={color} />;
  }
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  // Ensure we have unique categories by filtering out any duplicates based on ID
  const uniqueCategories = categories.filter(
    (category, index, self) =>
      index === self.findIndex((c) => c.id === category.id)
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {uniqueCategories.map((category) => (
        <TouchableOpacity
          key={`category-${category.id}`}
          style={[
            styles.categoryButton,
            { backgroundColor: category.color },
            selectedCategory?.id === category.id && styles.selectedCategory,
          ]}
          activeOpacity={1}
          onPress={() => onSelectCategory(category)}
        >
          <View style={styles.iconContainer}>
            {getCategoryIcon(category.icon)}
          </View>
          <Text
            style={[
              styles.categoryText,
              selectedCategory?.id === category.id &&
                styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  categoryButton: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  selectedCategory: {
    transform: [{ scale: 1.12 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CategorySelector;
