/**
 * Gym Management System — Core Application Script
 *
 * This file contains shared utilities and initialization logic
 * used across all pages. Feature-specific logic will be added
 * in future iterations.
 */

'use strict';

const App = {
  /**
   * Initialize the application.
   * Called on DOMContentLoaded.
   */
  init() {
    this.initNavigation();
    this.highlightActiveNav();
    if (document.getElementById('members-table-body')) {
      this.initMembersPage();
    }
  },

  /**
   * Set up mobile navigation toggle.
   */
  initNavigation() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('nav__links--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when clicking a link
    links.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('nav__links--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('nav__links--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  },

  /**
   * Highlight the navigation link that matches the current page.
   */
  highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  },

  /**
   * Utility: Generate initials from a full name.
   * @param {string} name
   * @returns {string}
   */
  getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join('');
  },

  /**
   * Utility: Format a date string for display.
   * @param {string|Date} date
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  },

  /**
   * Utility: Format a time string for display.
   * @param {string|Date} date
   * @returns {string}
   */
  formatTime(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  },

  /**
   * Initialize members page logic
   */
  async initMembersPage() {
    this.demoMembers = []; // Will store real members now

    this.searchInput = document.getElementById('member-search');
    this.filterSelect = document.getElementById('member-filter-status');
    this.tableBody = document.getElementById('members-table-body');
    this.tableWrapper = document.getElementById('members-table-wrapper');
    this.emptyState = document.getElementById('members-empty');
    this.countText = document.getElementById('member-count-text');

    this.searchInput.addEventListener('input', () => this.handleFilterMembers());
    this.filterSelect.addEventListener('change', () => this.handleFilterMembers());

    await this.fetchMembers();
  },

  async fetchMembers() {
    this.tableWrapper.style.display = 'none';
    this.emptyState.style.display = 'block';
    
    const titleEl = this.emptyState.querySelector('.empty-state__title');
    const descEl = this.emptyState.querySelector('.empty-state__description');
    
    titleEl.textContent = 'Loading members...';
    descEl.textContent = 'Please wait while we fetch the members list.';

    try {
      const { data, error } = await window.supabaseClient.from('members').select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        titleEl.textContent = 'No members yet';
        descEl.textContent = 'Add your first member to get started.';
        this.countText.textContent = '0 members';
        return;
      }

      // Map Supabase database columns to our frontend structure
      this.demoMembers = data.map(row => ({
        id: row.id,
        name: row.name || 'Unknown',
        phone: row.phone || '—',
        plan: row.plan || row.plan_name || '—',
        joinDate: this.formatDate(row.join_date || row.created_at || new Date()),
        expiryDate: this.formatDate(row.expiry_date || row.expires_at || new Date()),
        status: row.status || 'Active',
        photoUrl: row.photo_url || null,
        signedPhotoUrl: null
      }));

      // Generate signed URLs in a single batch request
      const pathsToSign = this.demoMembers.filter(m => m.photoUrl).map(m => m.photoUrl);
      if (pathsToSign.length > 0) {
        const { data: signedUrls, error: signError } = await window.supabaseClient
          .storage
          .from('member_photos')
          .createSignedUrls(pathsToSign, 60 * 60);

        if (!signError && signedUrls) {
          const urlMap = {};
          signedUrls.forEach(item => {
            if (!item.error && item.signedUrl) urlMap[item.path] = item.signedUrl;
          });

          this.demoMembers.forEach(m => {
            if (m.photoUrl && urlMap[m.photoUrl]) {
              m.signedPhotoUrl = urlMap[m.photoUrl];
            }
          });
        }
      }

      // Initially render everything
      this.handleFilterMembers();

    } catch (err) {
      titleEl.textContent = 'Failed to load members';
      descEl.textContent = err.message || 'An error occurred while fetching data from the database.';
      this.countText.textContent = 'Error';
    }
  },

  handleFilterMembers() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const filterStatus = this.filterSelect.value;

    const filtered = this.demoMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm) || member.phone.includes(searchTerm);
      
      let matchesFilter = true;
      if (filterStatus !== 'all') {
        const statusLower = member.status.toLowerCase();
        if (filterStatus === 'active' && statusLower !== 'active') matchesFilter = false;
        if (filterStatus === 'expiring' && statusLower !== 'expiring soon') matchesFilter = false;
        if (filterStatus === 'expired' && statusLower !== 'expired') matchesFilter = false;
      }

      return matchesSearch && matchesFilter;
    });

    this.renderMembers(filtered);
  },

  renderMembers(members) {
    const count = members.length;
    this.countText.textContent = `${count} member${count === 1 ? '' : 's'}`;

    if (count === 0) {
      this.tableWrapper.style.display = 'none';
      this.emptyState.style.display = 'block';
      this.emptyState.querySelector('.empty-state__title').textContent = 'No members found';
      this.emptyState.querySelector('.empty-state__description').textContent = 'Try adjusting your search or filter.';
      this.tableBody.innerHTML = '';
      return;
    }

    this.tableWrapper.style.display = 'block';
    this.emptyState.style.display = 'none';

    this.tableBody.innerHTML = members.map(member => {
      let badgeClass = 'badge--neutral';
      if (member.status === 'Active') badgeClass = 'badge--success';
      if (member.status === 'Expiring Soon') badgeClass = 'badge--warning';
      if (member.status === 'Expired') badgeClass = 'badge--danger';

      let avatarHtml = `<div class="avatar avatar--sm" aria-hidden="true">${this.getInitials(member.name)}</div>`;
      if (member.signedPhotoUrl) {
        avatarHtml = `<div class="avatar avatar--sm" aria-hidden="true" style="padding: 0; overflow: hidden;">
                        <img src="${member.signedPhotoUrl}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                      </div>`;
      }

      return `
        <tr>
          <td data-label="Member">
            <div class="flex items-center gap-3" style="width: 100%;">
              ${avatarHtml}
              <div class="flex items-center justify-between" style="flex: 1;">
                <div style="font-weight: 500; color: var(--text-primary);">${member.name}</div>
                <div class="mobile-status-badge"><span class="badge ${badgeClass}">${member.status}</span></div>
              </div>
            </div>
          </td>
          <td data-label="Phone">${member.phone}</td>
          <td data-label="Plan">${member.plan}</td>
          <td data-label="Joined" class="hide-on-mobile">${member.joinDate}</td>
          <td data-label="Expires">${member.expiryDate}</td>
          <td data-label="Status" class="hide-on-mobile"><span class="badge ${badgeClass}">${member.status}</span></td>
          <td data-action>
            <a href="member.html?id=${member.id}" class="btn btn--ghost btn--sm">View &rarr;</a>
          </td>
        </tr>
      `;
    }).join('');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
