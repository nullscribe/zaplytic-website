import { suite, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderPathWithRouter } from "test-setup";
import { team, values, CONTACT_EMAIL } from "@/loaders/team";

suite("About page", () => {
  test("renders the about page at /about", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    expect(await screen.findByTestId("aboutpage")).toBeInTheDocument();
  });

  test("renders the story hero title and lead", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    expect(await screen.findByTestId("aboutpage")).toBeInTheDocument();
    expect(document.getElementById("about-title")).toBeInTheDocument();
  });

  test("renders every team member's name and role", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    for (const member of team) {
      expect(await screen.findByText(member.name)).toBeInTheDocument();
      expect(await screen.findByText(member.role)).toBeInTheDocument();
    }
  });

  test("renders every value title as a chip", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    for (const value of values) {
      expect(await screen.findByRole("button", { name: value.title })).toBeInTheDocument();
    }
  });

  test("shows the first value's description by default", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    expect(await screen.findByText(values[0].description)).toBeInTheDocument();
  });

  test("contact mailto link points to the right email", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    const mailto = await screen.findByRole("link", {
      name: new RegExp(CONTACT_EMAIL)
    });
    expect(mailto).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
  });

  test("contact section has a usable anchor for /about#contact deep links", async () => {
    renderPathWithRouter({ initialEntries: ["/about"] });
    expect(await screen.findByText("Get in touch")).toBeInTheDocument();
    expect(document.getElementById("contact")).toBeInTheDocument();
  });
});
