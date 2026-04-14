import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const ensureTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (window.__turnstileScriptPromise) {
    return window.__turnstileScriptPromise;
  }

  window.__turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Turnstile script.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script.'));
    document.head.appendChild(script);
  });

  return window.__turnstileScriptPromise;
};

export type TurnstileWidgetRef = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  siteKey: string;
  action: string;
  onTokenChange: (token: string) => void;
  onExpired: () => void;
  onError: (message: string) => void;
};

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget({
    siteKey,
    action,
    onTokenChange,
    onExpired,
    onError,
  }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const reset = useCallback(() => {
      onTokenChange('');
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }, [onTokenChange]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    useEffect(() => {
      let isMounted = true;

      if (!siteKey) {
        setIsLoading(false);
        return;
      }

      const renderWidget = async () => {
        try {
          await ensureTurnstileScript();

          if (!isMounted || !containerRef.current || !window.turnstile) {
            return;
          }

          if (!widgetIdRef.current) {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              action,
              callback: (token: string) => {
                onTokenChange(token);
              },
              'expired-callback': () => {
                onTokenChange('');
                onExpired();
              },
              'error-callback': () => {
                onTokenChange('');
                onError('Captcha verification failed. Please try again.');
              },
              theme: 'light',
            });
          }

          setIsLoading(false);
        } catch {
          if (!isMounted) {
            return;
          }

          setIsLoading(false);
          onTokenChange('');
          onError('Could not load captcha. Please reload and try again.');
        }
      };

      void renderWidget();

      return () => {
        isMounted = false;
        if (window.turnstile && widgetIdRef.current && window.turnstile.remove) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [action, onError, onExpired, onTokenChange, siteKey]);

    if (!siteKey) {
      return (
        <div className="border border-black/15 bg-[#F8F8F6] px-4 py-3">
          <p
            className="text-[12px] leading-[1.4] text-[#8B0000]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Captcha site key is not configured. Set VITE_TURNSTILE_SITE_KEY.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {isLoading && (
          <p
            className="text-[12px] leading-[1.4] text-[#0A0A0A]/65"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Loading captcha challenge...
          </p>
        )}
        <div ref={containerRef} />
      </div>
    );
  },
);

export default TurnstileWidget;
