ALTER TABLE public.driver_details 
ADD COLUMN rcontrol_id text,
ADD COLUMN rcontrol_expiration date,
ADD COLUMN opalo_id text,
ADD COLUMN opalo_expiration date,
ADD COLUMN fasttrack_id text,
ADD COLUMN fasttrack_expiration date;

NOTIFY pgrst, 'reload schema';
