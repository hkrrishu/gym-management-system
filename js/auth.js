// auth.js
export const Auth = {
  async login(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Verify Admin status using the existing PostgreSQL function
    const { data: isAdmin, error: rpcError } = await window.supabaseClient.rpc('is_admin');
    
    if (rpcError || !isAdmin) {
      await window.supabaseClient.auth.signOut();
      throw new Error(rpcError?.message || "Unauthorized: Admin access required.");
    }
    
    return data;
  },

  async logout() {
    await window.supabaseClient.auth.signOut();
    window.location.replace('login.html');
  },

  async requireAdmin() {
    // 1. Check if user is authenticated locally
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.replace('login.html');
      return false;
    }
    
    // 2. Double-check admin authorization against the database to prevent tampered tokens
    const { data: isAdmin } = await window.supabaseClient.rpc('is_admin');
    
    if (!isAdmin) {
      await window.supabaseClient.auth.signOut();
      window.location.replace('login.html');
      return false;
    }
    
    // Show the page content now that authorization is fully verified
    document.body.style.display = '';
    return true;
  }
};

window.Auth = Auth;
