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
  initMembersPage() {
    this.demoMembers = [
      { name: "Rahul Kumar", phone: "9876543210", plan: "3 Months", joinDate: "22 Jun 2026", expiryDate: "22 Sep 2026", status: "Expired" },
      { name: "Aman Singh", phone: "9876543211", plan: "6 Months", joinDate: "20 Mar 2026", expiryDate: "20 Sep 2026", status: "Expired" },
      { name: "Rohit Sharma", phone: "9876543212", plan: "3 Months", joinDate: "18 Jul 2026", expiryDate: "18 Oct 2026", status: "Active" },
      { name: "Arjun Singh", phone: "9876543213", plan: "6 Months", joinDate: "20 Apr 2026", expiryDate: "20 Oct 2026", status: "Active" },
      { name: "Vikas Kumar", phone: "9876543214", plan: "3 Months", joinDate: "18 Jul 2026", expiryDate: "18 Oct 2026", status: "Active" },
      { name: "Priya Sharma", phone: "9876543215", plan: "12 Months", joinDate: "22 Sep 2026", expiryDate: "22 Sep 2027", status: "Active" },
      { name: "Neha Gupta", phone: "9876543216", plan: "3 Months", joinDate: "25 Jun 2026", expiryDate: "25 Sep 2026", status: "Expiring Soon" },
      { name: "Karan Singh", phone: "9876543217", plan: "3 Months", joinDate: "28 Jun 2026", expiryDate: "28 Sep 2026", status: "Expiring Soon" },
      { name: "Saurabh Verma", phone: "9876543218", plan: "6 Months", joinDate: "15 Apr 2026", expiryDate: "15 Oct 2026", status: "Active" },
      { name: "Anjali Singh", phone: "9876543219", plan: "1 Month", joinDate: "05 Aug 2026", expiryDate: "05 Sep 2026", status: "Expired" }
    ];

    this.searchInput = document.getElementById('member-search');
    this.filterSelect = document.getElementById('member-filter-status');
    this.tableBody = document.getElementById('members-table-body');
    this.tableWrapper = document.getElementById('members-table-wrapper');
    this.emptyState = document.getElementById('members-empty');
    this.countText = document.getElementById('member-count-text');

    this.renderMembers(this.demoMembers);

    this.searchInput.addEventListener('input', () => this.handleFilterMembers());
    this.filterSelect.addEventListener('change', () => this.handleFilterMembers());
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

      return `
        <tr>
          <td data-label="Member">
            <div class="flex items-center gap-3" style="width: 100%;">
              <div class="avatar avatar--sm" aria-hidden="true">${this.getInitials(member.name)}</div>
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
            <a href="member.html" class="btn btn--ghost btn--sm">View &rarr;</a>
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
