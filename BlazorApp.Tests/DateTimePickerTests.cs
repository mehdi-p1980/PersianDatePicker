using Bunit;
using BlazorApp.Shared;
using Xunit;
using System;

namespace BlazorApp.Tests
{
    public class DateTimePickerTests : TestContext
    {
        [Fact]
        public void ComponentRendersCorrectly()
        {
            // Arrange
            var cut = RenderComponent<DateTimePicker>();

            // Assert
            cut.MarkupMatches(@"<div class=""input-group""><input type=""text"" class=""form-control"" value=""""><button class=""btn btn-outline-secondary"" type=""button""><span class=""oi oi-calendar""></span></button></div>");
        }

        [Fact]
        public void SelectingDateUpdatesValue()
        {
            // Arrange
            var cut = RenderComponent<DateTimePicker>();
            var initialValue = cut.Instance.Value;

            // Act
            cut.Find("button.btn-outline-secondary").Click();
            cut.Find("td:not(.other-month)").Click();

            // Assert
            Assert.NotEqual(initialValue, cut.Instance.Value);
        }

        [Fact]
        public void CanSwitchToPersianCalendar()
        {
            // Arrange
            var cut = RenderComponent<DateTimePicker>();

            // Act
            cut.Find("button.btn-outline-secondary").Click(); // Open calendar
            cut.Find("button.btn-outline-secondary").Click(); // Switch to Persian

            // Assert
            cut.MarkupContains("/1403"); // A simple check for the Persian year
        }
    }
}
