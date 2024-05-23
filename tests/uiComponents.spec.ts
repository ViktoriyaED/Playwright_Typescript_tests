import { test, expect } from '@playwright/test'
import { assert } from 'console'
// import exp from 'constants'

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/')
})

test.describe('homePage', () => {
    test('sliders', async({page}) => {
        //update attribute
        const tempGauge = page.locator('[ng-reflect-tab-title="Temperature"][ng-reflect-tab-title="Temperature"] circle');
        await tempGauge.evaluate( node => {
            node.setAttribute('cx', '232.630');
            node.setAttribute('cy', '232.630');
        })
        await tempGauge.click();

        //mouse movement
        const tempBox = page.locator('[ng-reflect-tab-title="Temperature"] ngx-temperature-dragger');
        await tempBox.scrollIntoViewIfNeeded();

        const box = await tempBox.boundingBox();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x+100, y);
        await page.mouse.move(x+100, y+100);
        await page.mouse.up();

        await expect(tempBox).toContainText('30');
    })
})

test.describe('Form Layouts page', () => {
    test.beforeEach(async ({ page }) => {
        await page.getByText('Forms').click();
        // await page.getByText('Form Layouts').click();
    })

    test('input fields', async ({ page }) => {
        await page.getByText('Form Layouts').click();
        const usingTheGridEmailInput = page.locator('nb-card', { hasText: "Using the Grid" }).getByRole('textbox', { name: "Email" });

        await usingTheGridEmailInput.fill('test@test.com');
        await usingTheGridEmailInput.clear();
        await usingTheGridEmailInput.pressSequentially('test2@test.com', { delay: 200 });

        // const inputValue = await usingTheGridEmailInput.textContent();
        const inputValue = await usingTheGridEmailInput.inputValue();

        expect(inputValue).toEqual('test2@test.com')

        await expect(usingTheGridEmailInput).toHaveValue('test2@test.com');
    })

    test('radio buttons', async ({ page }) => {
        await page.getByText('Form Layouts').click();
        const usingTheGridForm = page.locator('nb-card', { hasText: "Using the Grid" });

        await usingTheGridForm.getByLabel('Option 1').check({ force: true });
        await usingTheGridForm.getByRole('radio', { name: "Option 1" }).check({ force: true });

        const radio1Status = await usingTheGridForm.getByRole('radio', { name: "Option 1" }).isChecked();
        //generic assertion
        expect(radio1Status).toBeTruthy();
        //locator assertion
        await expect(usingTheGridForm.getByRole('radio', { name: "Option 1" })).toBeChecked();

        await usingTheGridForm.getByRole('radio', { name: "Option 2" }).check({ force: true });
        
        await expect(usingTheGridForm.getByRole('radio', { name: "Option 2" })).toBeChecked();
        expect(await usingTheGridForm.getByRole('radio', { name: "Option 1" }).isChecked()).toBeFalsy();
    })

    test('lists and dropdowns', async({page}) => {
        await page.getByText('Form Layouts').click();
        const dropDownMenu = page.locator('nb-select');

        await dropDownMenu.click();
        // const optionList  = page.getByRole('list').locator('nb-option');
        const optionList  = page.locator('nb-option-list nb-option');

        expect(await optionList.count()).toEqual(4);
        await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"]);

        await optionList.filter({hasText: "Cosmic"}).click();

        const header = page.locator('nb-layout-header');
        await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)');

        await dropDownMenu.click();
        const styleColors = {
            "Light": "rgb(255, 255, 255)",
            "Dark": "rgb(34, 43, 69)",
            "Cosmic": "rgb(50, 50, 89)",
            "Corporate": "rgb(255, 255, 255)"
        }

        for(const color in styleColors) {
            await optionList.filter({hasText: color}).click();
            await expect(header).toHaveCSS('background-color', styleColors[color]);
            if (color != "Corporate") {
                await dropDownMenu.click();
            }
        }
    })

    test('datepicker', async({page}) => {
        await page.getByText('Datepicker').click();
        const calendarInputField = page.getByPlaceholder('Form Picker');
        await calendarInputField.click();

        // await page.locator('[class="day-cell ng-star-inserted"]').getByText("20").click();
        await page.locator('[class="day-cell ng-star-inserted"]').getByText('1', {exact: true}).click();
        await expect(calendarInputField).toHaveValue('May 1, 2024');
    })

    test('datepicker1', async({page}) => {
        await page.getByText('Datepicker').click();
        const calendarInputField = page.getByPlaceholder('Form Picker');
        await calendarInputField.click();

        let date = new Date();
        date.setDate(date.getDate() + 20);
        const expectedDate = date.getDate().toString();
        const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'});
        const expectedMonthLong = date.toLocaleString('En-US', {month: 'long'});
        const expectedYear = date.getFullYear().toString();
        const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`;

        let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').getByRole('button').textContent();
        const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear} `;

        while(!calendarMonthAndYear.includes(expectedMonthAndYear)) {
            await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click();
            calendarMonthAndYear = await page.locator('nb-calendar-view-mode').getByRole('button').textContent();
        }
                
        await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click();
        await expect(calendarInputField).toHaveValue(dateToAssert);
    })
})

test.describe('Modal & Overlays page', () => {
    test.beforeEach(async ({page}) => {
        await page.getByText('Modal & Overlays').click();
    })

    test('checkboxes', async ({ page }) => {
        await page.getByText('Toastr').click();

        await page.getByRole('checkbox', {name: "Hide on click"}).click({force: true});
        await page.getByRole('checkbox', {name: "Prevent arising of duplicate toast"}).check({force: true});

        const allCheckboxes = page.getByRole('checkbox');

        for (const checkbox of await allCheckboxes.all()) {
            await checkbox.check({force: true});
            expect(await checkbox.isChecked()).toBeTruthy();
            await expect(checkbox).toBeChecked();
        }

        for (const checkbox of await allCheckboxes.all()) {
            await checkbox.uncheck({force: true});
            expect(await checkbox.isChecked()).toBeFalsy();
            await expect(checkbox).not.toBeChecked();
        }
    })

    test('tooltips', async({page}) => {
        await page.getByText('Tooltip').click();

        const tooltipCard = page.locator('nb-card', {hasText: "Tooltip Placements"});
        await tooltipCard.getByRole('button', {name: "Top"}).hover();

        const tooltip = await page.locator('nb-tooltip').textContent();
        expect(tooltip).toEqual("This is a tooltip");
    } )   
})

test.describe('Tables & Data', () => {
    test.beforeEach(async({page}) => {
        await page.getByText('Tables & Data').click();
    })

    test('dialog box', async({page}) => {
        await page.getByText('Smart Table').click();

        page.on('dialog', dialog => {
            expect(dialog.message()).toEqual('Are you sure you want to delete?');
            dialog.accept();
        })
        await page.getByRole('table').locator('tr', {hasText: "mdo@gmail.com"}).locator('.nb-trash').click();
        await expect(page.locator('table tr').first()).not.toHaveText("mdo@gmail.com");
    })

    test('web tables', async({page}) => {
        await page.getByText('Smart Table').click();

       // get the row by any data in this row
        const targetRow = page.getByRole('row', {name: "twitter@outlook.com"});
        await targetRow.locator('.nb-edit').click();
        const targetAge = page.locator('input-editor').getByPlaceholder('Age');
        await targetAge.clear();
        await targetAge.fill('15');
        await page.locator('.nb-checkmark').click();

        //get the row based on the value in the specific column
        await page.locator('.ng2-smart-pagination-nav').getByText('2').click();

        const targetRowById = page.getByRole('row', {name: "11"}).filter({has: page.locator('td').nth(1).getByText('11')});
        await targetRowById.locator('.nb-edit').click();

        const targetEmail = page.locator('input-editor').getByPlaceholder('E-mail');
        await targetEmail.clear();
        await targetEmail.fill('test@test.com');
        await page.locator('.nb-checkmark').click(); 
        await expect(targetRowById.locator('td').nth(5)).toHaveText('test@test.com');

        //test filter of the table

        const ages = ["20", "30", "40", "200"];

        for (let age of ages) {
            await page.locator('input-filter').getByPlaceholder('Age').clear();
            await page.locator('input-filter').getByPlaceholder('Age').fill(age);
            await page.waitForTimeout(500);

            const ageRows = page.locator('tbody tr');

            for(let row of await ageRows.all()) {
                const cellValue = await row.locator('td').last().textContent();

                if(age == "200") {
                    expect(await page.getByRole('table').textContent()).toContain('No data found');
                } else {
                    expect(cellValue).toEqual(age);
                }                
            }
        }    
    })
})