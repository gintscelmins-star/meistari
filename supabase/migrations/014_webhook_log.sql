-- 014_webhook_log.sql: Twilio webhook event log

CREATE TABLE IF NOT EXISTS webhook_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   text NOT NULL,
  status       text NOT NULL DEFAULT 'success',
  from_number  text,
  prospect_id  uuid REFERENCES prospects(id) ON DELETE SET NULL,
  details      jsonb,
  error_message text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE webhook_log
  ADD CONSTRAINT webhook_log_event_type_check CHECK (
    event_type IN (
      'incoming_sms', 'incoming_wa', 'ja_response',
      'anketa_sent', 'admin_notified',
      'invalid_signature', 'unknown_sender', 'error'
    )
  ),
  ADD CONSTRAINT webhook_log_status_check CHECK (
    status IN ('success', 'error', 'ignored')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS webhook_log_created_at_idx  ON webhook_log(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_log_event_type_idx  ON webhook_log(event_type);
CREATE INDEX IF NOT EXISTS webhook_log_status_idx      ON webhook_log(status);
CREATE INDEX IF NOT EXISTS webhook_log_prospect_id_idx ON webhook_log(prospect_id);

-- RLS (service role bypasses; no public access needed)
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
