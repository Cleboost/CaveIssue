import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['employe', 'responsable', 'administrateur']);
export const priorityEnum = pgEnum('priority', ['basse', 'moyenne', 'haute', 'critique']);
export const statusEnum = pgEnum('status', ['nouveau', 'en_cours', 'en_attente', 'resolu', 'cloture']);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  role: roleEnum('role').notNull().default('employe'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  incidents: many(incident),
}));

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const incident = pgTable('incident', {
  id: text('id').primaryKey(),
  reporterId: text('reporter_id')
    .notNull()
    .references(() => user.id),
  originalDescription: text('original_description').notNull(),
  title: text('title'),
  zoneId: text('zone_id').references(() => zone.id),
  categoryId: text('category_id').references(() => category.id),
  priority: priorityEnum('priority').default('moyenne'),
  status: statusEnum('status').notNull().default('nouveau'),
  assignedTo: text('assigned_to'),
  aiSummary: text('ai_summary'),
  aiSuggestedActions: text('ai_suggested_actions'),
  aiMissingInfo: text('ai_missing_info'),
  aiConfidence: text('ai_confidence'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const incidentRelations = relations(incident, ({ one }) => ({
  reporter: one(user, {
    fields: [incident.reporterId],
    references: [user.id],
  }),
  zone: one(zone, {
    fields: [incident.zoneId],
    references: [zone.id],
  }),
  category: one(category, {
    fields: [incident.categoryId],
    references: [category.id],
  }),
}));

export const zone = pgTable('zone', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const zoneRelations = relations(zone, ({ many }) => ({
  incidents: many(incident),
}));

export const category = pgTable('category', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  incidents: many(incident),
}));

export const assignmentRule = pgTable('assignment_rule', {
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => category.id),
  assignedTo: text('assigned_to').notNull(), // Service name or user ID
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const assignmentRuleRelations = relations(assignmentRule, ({ one }) => ({
  category: one(category, {
    fields: [assignmentRule.categoryId],
    references: [category.id],
  }),
}));
