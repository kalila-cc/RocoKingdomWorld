"use client";

import { useEffect } from "react";

export function useActiveSectionNavigation() {
  useEffect(() => {
    const navigation = document.querySelector<HTMLElement>(".side-nav");
    if (!navigation) return;

    const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const sections = links
      .map((link) => document.getElementById(link.hash.slice(1)))
      .filter((section): section is HTMLElement => Boolean(section));
    const activate = (id: string) => {
      links.forEach((link) => {
        const active = link.hash === `#${id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const handleClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (link) activate(link.hash.slice(1));
    };

    navigation.addEventListener("click", handleClick);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * .18) - Math.abs(b.boundingClientRect.top - window.innerHeight * .18));
      if (visible[0]) activate(visible[0].target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    activate(window.location.hash.slice(1) || "top");

    return () => {
      observer.disconnect();
      navigation.removeEventListener("click", handleClick);
    };
  }, []);
}
