/**
 * PageHeader Component
 * Reusable header for all pages with consistent styling
 * Supports RTL layout for Arabic language
 */

import React from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { Text, Icon, useTheme, IconButton } from 'react-native-paper';
import { useLanguage } from '../contexts';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    label?: string;
  }>;
  style?: any;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  showBackButton = false,
  onBackPress,
  rightActions,
  style,
}) => {
  const theme = useTheme();
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.leftSection, isRTL && styles.rtlLeftSection]}>
        {showBackButton && (
          <IconButton
            icon={isRTL ? "arrow-right" : "arrow-left"}
            size={24}
            iconColor={theme.colors.onPrimary}
            onPress={onBackPress}
          />
        )}
        {icon && !showBackButton && (
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
            <Icon source={icon} size={28} color={theme.colors.onPrimary} />
          </View>
        )}
        <View style={styles.titleSection}>
          <Text
            variant="displaySmall"
            style={[styles.title, { color: theme.colors.onSurface, textAlign: isRTL ? 'right' : 'left' }]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant, textAlign: isRTL ? 'right' : 'left' }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightActions?.map((action, index) => (
          <IconButton
            key={index}
            icon={action.icon}
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rtlLeftSection: {
    flexDirection: 'row-reverse',
  },
  titleSection: {
    flex: 1,
    marginLeft: 8,
    alignItems: 'flex-start',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
});