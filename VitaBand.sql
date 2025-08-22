-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.color (
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying,
  hexa character varying,
  CONSTRAINT color_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gender (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying NOT NULL,
  CONSTRAINT gender_pkey PRIMARY KEY (id)
);
CREATE TABLE public.medication (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  id_user bigint,
  start date NOT NULL,
  finish date NOT NULL,
  frecuency character varying NOT NULL,
  id_meds bigint,
  CONSTRAINT medication_pkey PRIMARY KEY (id),
  CONSTRAINT medication_id_meds_fkey FOREIGN KEY (id_meds) REFERENCES public.meds(id),
  CONSTRAINT medication_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.users(id)
);
CREATE TABLE public.meds (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying NOT NULL,
  CONSTRAINT meds_pkey PRIMARY KEY (id)
);
CREATE TABLE public.relations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  id_bander bigint,
  id_host bigint,
  id_rels bigint,
  confirmed boolean DEFAULT false,
  CONSTRAINT relations_pkey PRIMARY KEY (id),
  CONSTRAINT relations_id_bander_fkey FOREIGN KEY (id_bander) REFERENCES public.users(id),
  CONSTRAINT relations_id_rels_fkey FOREIGN KEY (id_rels) REFERENCES public.rels(id),
  CONSTRAINT relations_id_host_fkey FOREIGN KEY (id_host) REFERENCES public.users(id)
);
CREATE TABLE public.rels (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying NOT NULL,
  CONSTRAINT rels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reminder (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  title character varying NOT NULL,
  description character varying NOT NULL,
  id_color smallint NOT NULL,
  repetition integer NOT NULL,
  confirmed boolean NOT NULL,
  id_medication bigint,
  hour smallint,
  min smallint,
  CONSTRAINT reminder_pkey PRIMARY KEY (id),
  CONSTRAINT reminder_id_medication_fkey FOREIGN KEY (id_medication) REFERENCES public.medication(id),
  CONSTRAINT reminder_id_color_fkey FOREIGN KEY (id_color) REFERENCES public.color(id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying,
  mail character varying NOT NULL,
  password character varying NOT NULL,
  surname character varying,
  birthdate date,
  phone character varying,
  created_at timestamp with time zone,
  last_sign_in timestamp with time zone,
  picture character varying,
  id_gender bigint,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_gender_fkey FOREIGN KEY (id_gender) REFERENCES public.gender(id)
);