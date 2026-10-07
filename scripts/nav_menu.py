"""Shared markup for the main nav: Residential and Commercial mega menus.

Used by build_subpages.py (service sub pages) and apply_nav.py (the hand
written pages), so every page carries the same nav. Edit MENUS, then re-run
both scripts.
"""
from html import escape

CARET = ('<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" '
         'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>')
ARROW = "→"

QUOTE_HREF = "index.html#contact"
ACCOUNT_HREF = "commercial.html#account"
INDUSTRIES_HREF = "commercial.html#industries"
PHONE = "803-600-4357"
PHONE_HREF = "tel:18036004357"

MENUS = {
    "residential": {
        "label": "Residential",
        "href": "services.html",
        "all_label": "See all residential services",
        "columns": [
            ("Pipes & Leaks", [
                ("Emergency Plumbing", "residential-emergency-plumbing.html"),
                ("Leak Detection", "residential-leak-detection.html"),
                ("Whole-House Repipes", "residential-repiping.html"),
                ("Bathroom Repairs & Remodels", "residential-bathrooms.html"),
            ]),
            ("Drains & Sewer", [
                ("Drain Cleaning & Jetting", "residential-drain-cleaning.html"),
                ("Sewer Services", "residential-sewer-services.html"),
            ]),
            ("Water & Gas", [
                ("Water Heater Repair & Replacement", "residential-water-heaters.html"),
                ("Tankless Water Heaters", "tankless.html"),
                ("Gas Line Repair & Service", "residential-gas-lines.html"),
                ("Well Pump Repair & Installation", "residential-well-pumps.html"),
                ("Water Filtration & Treatment", "residential-water-filtration.html"),
            ]),
        ],
        "extra_links": [],
        "feature": {
            "heading": "Need a Plumber?",
            "text": "Licensed, bonded, and insured. 24/7 emergency service.",
            "button": ("Get a Quote", QUOTE_HREF),
        },
    },
    "commercial": {
        "label": "Commercial",
        "href": "commercial.html",
        "all_label": "See all commercial services",
        "columns": [
            ("Pipes & Leaks", [
                ("Emergency & Backflow", "commercial-emergency-backflow.html"),
                ("Leak Detection & Water Line Repair", "commercial-leak-detection.html"),
                ("Commercial Repiping", "commercial-repiping.html"),
                ("Restroom & Kitchen", "commercial-restroom-kitchen.html"),
            ]),
            ("Drains & Sewer", [
                ("Drain Cleaning & Jetting", "commercial-drain-cleaning.html"),
                ("Sewer Line Services", "commercial-sewer-services.html"),
            ]),
            ("Water, Gas & Upkeep", [
                ("Commercial Water Heaters", "commercial-water-heaters.html"),
                ("Gas Line Services & Testing", "commercial-gas-lines.html"),
                ("Water Treatment & Filtration", "commercial-water-treatment.html"),
                ("Monthly Maintenance Contracts", "commercial-maintenance-contracts.html"),
            ]),
        ],
        "extra_links": [("Industries We Serve", INDUSTRIES_HREF)],
        "feature": {
            "heading": "Commercial Accounts",
            "text": "Maintenance plans and priority service for businesses and property managers.",
            "button": ("Set Up an Account", ACCOUNT_HREF),
        },
    },
}


def _feature(menu, cls):
    f = menu["feature"]
    return f"""<div class="{cls}">
          <p class="{cls}__h">{escape(f['heading'])}</p>
          <p class="{cls}__t">{escape(f['text'])}</p>
          <a class="btn btn--brick btn--sm" href="{f['button'][1]}">{escape(f['button'][0])}</a>
          <a class="{cls}__tel" href="{PHONE_HREF}">{PHONE}</a>
        </div>"""


def _desktop_item(key, active, current_page):
    m = MENUS[key]
    cur = ' aria-current="page"' if current_page == key else ""
    act = " is-active" if active == key else ""
    cols = ""
    for heading, links in m["columns"]:
        items = "\n".join(f'              <li><a href="{h}">{escape(t)}</a></li>' for t, h in links)
        cols += f"""
          <div class="mega__col">
            <p class="mega__h">{escape(heading)}</p>
            <ul>
{items}
            </ul>
          </div>"""
    extras = "".join(f'<a class="mega__more" href="{h}">{escape(t)} {ARROW}</a>' for t, h in m["extra_links"])
    return f"""      <div class="nav__item{act}" data-menu>
        <a class="nav__link" href="{m['href']}"{cur}>{m['label']}</a>
        <button class="nav__caret" type="button" aria-expanded="false" aria-controls="mega-{key}" aria-label="{m['label']} services menu">{CARET}</button>
        <div class="mega" id="mega-{key}">
          <div class="mega__cols">{cols}
          </div>
          {_feature(m, 'mega__feature')}
          <div class="mega__foot">
            <a class="mega__all" href="{m['href']}">{m['all_label']} {ARROW}</a>{extras}
          </div>
        </div>
      </div>"""


def desktop_links(active=None, current_page=None, contact_href="index.html#contact"):
    """Inner HTML of <nav class="nav__links">. `active` highlights a parent
    section (sub pages); `current_page` marks the exact page (aria-current)."""
    def link(href, label, key):
        cur = ' aria-current="page"' if current_page == key else ""
        return f'      <a href="{href}"{cur}>{label}</a>'
    return "\n".join([
        link("index.html", "Home", "home"),
        _desktop_item("residential", active, current_page),
        _desktop_item("commercial", active, current_page),
        link("tankless.html", "Tankless", "tankless"),
        link("financing.html", "Financing", "financing"),
        link("story.html", "Our Story", "story"),
        link(contact_href, "Contact", "contact"),
    ])


def _drawer_item(key, active, current_page):
    m = MENUS[key]
    cur = ' aria-current="page"' if current_page == key else ""
    act = " is-active" if active == key else ""
    links = ""
    for heading, items in m["columns"]:
        links += f'\n        <p class="acc__h">{escape(heading)}</p>'
        links += "".join(f'\n        <a href="{h}">{escape(t)}</a>' for t, h in items)
    for t, h in m["extra_links"]:
        links += f'\n        <a class="acc__more" href="{h}">{escape(t)}</a>'
    return f"""    <div class="acc{act}">
      <div class="acc__row">
        <a href="{m['href']}"{cur}>{m['label']} Services</a>
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-{key}" aria-label="Show {m['label'].lower()} services">{CARET}</button>
      </div>
      <div class="acc__panel" id="acc-{key}" hidden>{links}
        <a class="acc__all" href="{m['href']}">{m['all_label']} {ARROW}</a>
        {_feature(m, 'acc__feature')}
      </div>
    </div>"""


def drawer_links(active=None, current_page=None, contact_href="index.html#contact"):
    """Inner HTML of <nav aria-label="Mobile">."""
    def link(href, label, extra=""):
        return f'    <a href="{href}"{extra}>{label}</a>'
    return "\n".join([
        link("index.html", "Home"),
        _drawer_item("residential", active, current_page),
        _drawer_item("commercial", active, current_page),
        link("tankless.html", "Tankless Water Heaters"),
        link("financing.html", "Financing"),
        link("story.html", "Our Story"),
        link(contact_href, "Contact"),
        link("https://gotanklesssc.com/", "Go Tankless SC", ' target="_blank" rel="noopener"'),
    ])
