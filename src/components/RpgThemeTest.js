/**
 * RPG THEME TEST COMPONENT
 * 
 * Composant de test pour valider que le thème RPG fonctionne correctement
 * Affiche des exemples de tous les éléments du thème
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { 
  rpgTheme, 
  getStatColor, 
  getStatIcon, 
  getRankColor, 
  getRankIcon,
  addAlpha 
} from '../theme/rpgTheme';

const RpgThemeTest = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>🎨 RPG Theme Test</Text>
      
      {/* ===== COLORS SECTION ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Couleurs Néon</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: rpgTheme.colors.neon.blue }]}>
            <Text style={styles.colorLabel}>Blue</Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: rpgTheme.colors.neon.purple }]}>
            <Text style={styles.colorLabel}>Purple</Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: rpgTheme.colors.neon.cyan }]}>
            <Text style={styles.colorLabel}>Cyan</Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: rpgTheme.colors.neon.green }]}>
            <Text style={styles.colorLabel}>Green</Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: rpgTheme.colors.neon.pink }]}>
            <Text style={styles.colorLabel}>Pink</Text>
          </View>
        </View>
      </Card>

      {/* ===== STATS COLORS ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Couleurs des Stats</Text>
        <View style={styles.statsContainer}>
          {['strength', 'endurance', 'power', 'speed', 'flexibility'].map(stat => (
            <Chip
              key={stat}
              mode="outlined"
              style={[styles.statChip, { borderColor: getStatColor(stat) }]}
              textStyle={{ color: getStatColor(stat) }}
            >
              {getStatIcon(stat)} {stat}
            </Chip>
          ))}
        </View>
      </Card>

      {/* ===== RANKS COLORS ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Couleurs des Ranks</Text>
        <View style={styles.ranksContainer}>
          {['beginner', 'warrior', 'champion', 'master', 'legend'].map(rank => (
            <View
              key={rank}
              style={[
                styles.rankBadge,
                { 
                  backgroundColor: addAlpha(getRankColor(rank), 0.2),
                  borderColor: getRankColor(rank)
                }
              ]}
            >
              <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
                {getRankIcon(rank)} {rank}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* ===== SHADOWS & GLOWS ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Ombres et Glows</Text>
        
        <View style={styles.shadowsContainer}>
          <View style={[styles.shadowBox, rpgTheme.effects.shadows.card]}>
            <Text style={styles.shadowLabel}>Card Shadow</Text>
          </View>
          
          <View style={[styles.shadowBox, rpgTheme.effects.shadows.glow]}>
            <Text style={styles.shadowLabel}>Glow Effect</Text>
          </View>
          
          <View style={[styles.shadowBox, rpgTheme.effects.shadows.heavy]}>
            <Text style={styles.shadowLabel}>Heavy Shadow</Text>
          </View>
        </View>
      </Card>

      {/* ===== TYPOGRAPHY ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Typographie</Text>
        
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.title }]}>
          Title (28px)
        </Text>
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.heading }]}>
          Heading (22px)
        </Text>
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.subheading }]}>
          Subheading (18px)
        </Text>
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.body }]}>
          Body (16px)
        </Text>
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.caption }]}>
          Caption (14px)
        </Text>
        <Text style={[styles.typoExample, { fontSize: rpgTheme.typography.sizes.small }]}>
          Small (12px)
        </Text>
      </Card>

      {/* ===== BUTTONS ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>
        
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: rpgTheme.colors.neon.blue }]}
          labelStyle={{ color: rpgTheme.colors.text.primary }}
        >
          Primary Button
        </Button>
        
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: rpgTheme.colors.neon.purple }]}
          labelStyle={{ color: rpgTheme.colors.text.primary }}
        >
          Secondary Button
        </Button>
        
        <Button
          mode="outlined"
          style={[styles.button, { borderColor: rpgTheme.colors.neon.cyan }]}
          labelStyle={{ color: rpgTheme.colors.neon.cyan }}
        >
          Outlined Button
        </Button>
      </Card>

      {/* ===== SPACING ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Spacing System</Text>
        <View style={styles.spacingContainer}>
          <View style={[styles.spacingBox, { padding: rpgTheme.spacing.xs }]}>
            <Text style={styles.spacingLabel}>XS (4)</Text>
          </View>
          <View style={[styles.spacingBox, { padding: rpgTheme.spacing.sm }]}>
            <Text style={styles.spacingLabel}>SM (8)</Text>
          </View>
          <View style={[styles.spacingBox, { padding: rpgTheme.spacing.md }]}>
            <Text style={styles.spacingLabel}>MD (16)</Text>
          </View>
          <View style={[styles.spacingBox, { padding: rpgTheme.spacing.lg }]}>
            <Text style={styles.spacingLabel}>LG (24)</Text>
          </View>
        </View>
      </Card>

      {/* ===== BORDER RADIUS ===== */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius</Text>
        <View style={styles.radiusContainer}>
          <View style={[styles.radiusBox, { borderRadius: rpgTheme.borderRadius.sm }]}>
            <Text style={styles.radiusLabel}>SM</Text>
          </View>
          <View style={[styles.radiusBox, { borderRadius: rpgTheme.borderRadius.md }]}>
            <Text style={styles.radiusLabel}>MD</Text>
          </View>
          <View style={[styles.radiusBox, { borderRadius: rpgTheme.borderRadius.lg }]}>
            <Text style={styles.radiusLabel}>LG</Text>
          </View>
          <View style={[styles.radiusBox, { borderRadius: rpgTheme.borderRadius.xl }]}>
            <Text style={styles.radiusLabel}>XL</Text>
          </View>
          <View style={[styles.radiusBox, { borderRadius: rpgTheme.borderRadius.full }]}>
            <Text style={styles.radiusLabel}>FULL</Text>
          </View>
        </View>
      </Card>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rpgTheme.colors.background.primary,
    padding: rpgTheme.spacing.md,
  },
  pageTitle: {
    fontSize: rpgTheme.typography.sizes.title,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: rpgTheme.spacing.lg,
  },
  section: {
    backgroundColor: rpgTheme.colors.background.card,
    padding: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: rpgTheme.colors.neon.blue + '40',
  },
  sectionTitle: {
    fontSize: rpgTheme.typography.sizes.subheading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.md,
  },
  
  // Colors
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: rpgTheme.spacing.sm,
  },
  colorBox: {
    flex: 1,
    height: 60,
    borderRadius: rpgTheme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.small,
    fontWeight: rpgTheme.typography.weights.bold,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rpgTheme.spacing.sm,
  },
  statChip: {
    borderWidth: 2,
  },
  
  // Ranks
  ranksContainer: {
    gap: rpgTheme.spacing.sm,
  },
  rankBadge: {
    padding: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  rankText: {
    fontSize: rpgTheme.typography.sizes.body,
    fontWeight: rpgTheme.typography.weights.bold,
  },
  
  // Shadows
  shadowsContainer: {
    gap: rpgTheme.spacing.lg,
  },
  shadowBox: {
    backgroundColor: rpgTheme.colors.background.card,
    padding: rpgTheme.spacing.lg,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    alignItems: 'center',
  },
  shadowLabel: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.body,
    fontWeight: rpgTheme.typography.weights.semibold,
  },
  
  // Typography
  typoExample: {
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.sm,
  },
  
  // Buttons
  button: {
    marginBottom: rpgTheme.spacing.sm,
    borderRadius: rpgTheme.borderRadius.md,
  },
  
  // Spacing
  spacingContainer: {
    gap: rpgTheme.spacing.sm,
  },
  spacingBox: {
    backgroundColor: rpgTheme.colors.neon.purple + '30',
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.purple,
    borderRadius: rpgTheme.borderRadius.sm,
  },
  spacingLabel: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.small,
  },
  
  // Border Radius
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rpgTheme.spacing.sm,
  },
  radiusBox: {
    width: 60,
    height: 60,
    backgroundColor: rpgTheme.colors.neon.cyan + '30',
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusLabel: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.small,
    fontWeight: rpgTheme.typography.weights.bold,
  },
});

export default RpgThemeTest;
