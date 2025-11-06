/**
 * Standardized Card Styles
 * Consistent card styling across the app
 */

import { StyleSheet } from 'react-native';

export const cardStyles = StyleSheet.create({
  // Standard card
  card: {
    marginBottom: 16,
    borderRadius: 20,
  },

  // Elevated card (default)
  elevatedCard: {
    marginBottom: 16,
    borderRadius: 20,
  },

  // Compact card for tight spaces
  compactCard: {
    marginBottom: 12,
    borderRadius: 16,
  },

  // Large card for important content
  largeCard: {
    marginBottom: 20,
    borderRadius: 24,
  },

  // Card content padding
  cardContent: {
    padding: 16,
  },

  // Compact card content
  compactContent: {
    padding: 12,
  },

  // Large card content
  largeContent: {
    padding: 20,
  },

  // Card sections
  cardSection: {
    marginBottom: 16,
  },

  // Card divider
  cardDivider: {
    marginVertical: 12,
    opacity: 0.12,
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Card title
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },

  // Card subtitle
  cardSubtitle: {
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
});

// Helper function to get card style based on size
export const getCardStyle = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return cardStyles.compactCard;
    case 'large':
      return cardStyles.largeCard;
    default:
      return cardStyles.card;
  }
};

// Helper function to get content padding based on size
export const getContentStyle = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return cardStyles.compactContent;
    case 'large':
      return cardStyles.largeContent;
    default:
      return cardStyles.cardContent;
  }
};