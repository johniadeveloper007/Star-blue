-- Run as a database administrator. Assign LOGIN and credentials through the
-- organization's secret-management process, not in this file.
CREATE ROLE perseo_app NOLOGIN;
CREATE ROLE perseo_migrator NOLOGIN;

GRANT CONNECT ON DATABASE perseo TO perseo_app, perseo_migrator;
GRANT USAGE ON SCHEMA public TO perseo_app, perseo_migrator;
GRANT CREATE ON SCHEMA public TO perseo_migrator;

GRANT SELECT, INSERT, UPDATE ON
    public.suppliers,
    public.supplier_contacts,
    public.import_batches,
    public.report_deliveries
TO perseo_app;
GRANT SELECT, INSERT ON
    public.reporting_periods,
    public.supplier_reports,
    public.report_revisions,
    public.report_metrics
TO perseo_app;
GRANT SELECT ON public.metric_definitions TO perseo_app;
GRANT SELECT, INSERT ON public.audit_events TO perseo_app;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO perseo_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO perseo_migrator;

