import { connectDB } from '../../utils/db';
import { User } from '../../models/User';
import { isEmailAllowed } from '../../utils/allowedEmails';
import { apiError } from '../../utils/apiError';

interface GoogleUserInfo {
  sub: string;
  email?: string;
  name?: string;
}

const renderPostMessageHtml = (targetOrigin: string, message: Record<string, unknown>) => `<script>
(function () {
  var message = ${JSON.stringify(message)};
  var target = ${JSON.stringify(targetOrigin)};
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, target);
  }
  window.close();
})();
</script>`;

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user: googleUser }: { user: GoogleUserInfo }) {
    const email = googleUser.email?.trim().toLowerCase();
    if (!email || !isEmailAllowed(email)) {
      return apiError(403, 'Your Google account is not authorized to use this application.');
    }

    await connectDB();

    const googleId = String(googleUser.sub);
    const displayName = googleUser.name?.trim() || email;

    let dbUser = await User.findOne({ googleId });

    if (!dbUser) {
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        existingByEmail.googleId = googleId;
        existingByEmail.displayName = displayName;
        await existingByEmail.save();
        dbUser = existingByEmail;
      } else {
        dbUser = await User.create({ googleId, displayName, email });
      }
    }

    await setUserSession(event, {
      user: { id: dbUser.id, displayName: dbUser.displayName, email: dbUser.email },
    });

    const html = renderPostMessageHtml(getRequestURL(event).origin, {
      type: 'GOOGLE_AUTH_SUCCESS',
      payload: {
        id: dbUser.id,
        displayName: dbUser.displayName,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
      },
    });
    return send(event, html, 'text/html');
  },
  onError(_event, error) {
    console.error('Google OAuth error', error);
    return apiError(500, 'Google authentication failed');
  },
});
