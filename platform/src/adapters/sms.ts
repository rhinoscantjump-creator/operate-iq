export interface SendSmsInput {
  to: string;
  body: string;
  idempotencyKey: string;
}

export interface SendSmsResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  dryRun?: boolean;
}

export interface SmsAdapter {
  id: string;
  send(input: SendSmsInput): Promise<SendSmsResult>;
}

/** Stub SMS adapter for dry-run and local pilots. Swap for Twilio later. */
export function createStubSmsAdapter(options?: { failKeys?: Set<string> }): SmsAdapter {
  const failKeys = options?.failKeys ?? new Set<string>();
  return {
    id: "sms-stub",
    async send(input) {
      if (failKeys.has(input.idempotencyKey)) {
        return { ok: false, error: "simulated_sms_timeout" };
      }
      if (!input.to || input.to.replace(/\D/g, "").length < 7) {
        return { ok: false, error: "bad_phone" };
      }
      return {
        ok: true,
        providerMessageId: `stub_${input.idempotencyKey}`,
        dryRun: true,
      };
    },
  };
}

export function createTwilioSmsAdapter(_config: {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}): SmsAdapter {
  // Credentials accepted so production wiring is a drop-in; not called until configured.
  return {
    id: "sms-twilio",
    async send() {
      return {
        ok: false,
        error: "twilio_not_configured_in_this_environment",
      };
    },
  };
}
