ALTER TABLE public.workshop_stays 
ADD COLUMN km_last_service numeric;

ALTER TABLE public.workshop_stays 
ADD COLUMN last_trip_start_date timestamp with time zone;
