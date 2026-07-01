CREATE TABLE "qualifying_results" (
	"id" text PRIMARY KEY NOT NULL,
	"race_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer NOT NULL,
	"q1" text,
	"q2" text,
	"q3" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qualifying_results_race_driver_unique" UNIQUE("race_id","driver_id")
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"resource" text PRIMARY KEY NOT NULL,
	"payload_hash" text NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_constructor_id_constructors_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("id") ON DELETE no action ON UPDATE no action;