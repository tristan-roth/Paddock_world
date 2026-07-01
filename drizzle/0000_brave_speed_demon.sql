CREATE TABLE "circuits" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"locality" text NOT NULL,
	"country" text NOT NULL,
	"continent" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constructor_standings" (
	"id" text PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"round" integer NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer NOT NULL,
	"points" real NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "constructor_standings_season_round_constructor_unique" UNIQUE("season","round","constructor_id")
);
--> statement-breakpoint
CREATE TABLE "constructors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nationality" text NOT NULL,
	"color" text,
	"engine_supplier" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_standings" (
	"id" text PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"round" integer NOT NULL,
	"driver_id" text NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer NOT NULL,
	"points" real NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "driver_standings_season_round_driver_unique" UNIQUE("season","round","driver_id")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text,
	"number" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"nationality" text NOT NULL,
	"date_of_birth" date,
	"place_of_birth" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_results" (
	"id" text PRIMARY KEY NOT NULL,
	"race_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"constructor_id" text NOT NULL,
	"grid" integer,
	"position" integer,
	"position_text" text,
	"points" real DEFAULT 0 NOT NULL,
	"status" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "race_results_race_driver_unique" UNIQUE("race_id","driver_id")
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" text PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"round" integer NOT NULL,
	"circuit_id" text NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"sprint_weekend" boolean DEFAULT false NOT NULL,
	"length_km" real,
	"laps" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "races_season_round_unique" UNIQUE("season","round")
);
--> statement-breakpoint
ALTER TABLE "constructor_standings" ADD CONSTRAINT "constructor_standings_constructor_id_constructors_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_standings" ADD CONSTRAINT "driver_standings_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_standings" ADD CONSTRAINT "driver_standings_constructor_id_constructors_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_constructor_id_constructors_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;